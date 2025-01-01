"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorState, ContentState } from "draft-js";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { PC, PenaltyQueryResult } from "@/convex/pc";
import { PenalCodeSearch } from "@/components/penal-code-search";
import { LineNumberEditor } from "./LineNumberEditor";
import { cn } from "@/lib/utils";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalysisResult } from "@/convex/serve";

// Dynamically import the Editor to avoid SSR issues
// const Editor = dynamic(
//   () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
//   { ssr: false }
// );

export type SELECTCODE = {
  _id: Id<"crimeElement">;
  _creationTime: number;
  pcId: Id<"pc">;
  element: string[];
  calcrim_example: string[];
  code_number: string;
  codeType: string;
  narrative: string;
  m_f: "M" | "F";
};

export function ReportValidator() {
  const [selectedCode, setSelectedCode] = useState<SELECTCODE[]>([]);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [penalCodes, setPenalCode] = useState<PenaltyQueryResult>();
  const [lineNumbers, setLineNumbers] = useState(true);
  const getCrimeElement = useAction(api.serve.crimeElement);
  const getCaseNo = useQuery(api.query.getAllCaseNo);
  const [caseSelect, setCaseSelect] = useState("");
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const validateReport = useAction(api.serve.validateReport);
  const generateExample = useAction(api.serve.generateExample);
  const suggestImprovements = useAction(api.serve.suggestImprovements);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const contentState = ContentState.createFromText(text);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Legal Report Validator</CardTitle>
        </CardHeader>
        <CardContent>
          <PenalCodeSearch
            setPenalCode={setPenalCode}
            penalCodes={penalCodes}
            handleAddPenalCode={async (idx) => {
              if (penalCodes === undefined) return;

              const penalCode = penalCodes[idx] as Doc<"pc">;
              const data = await getCrimeElement({
                pcId: penalCode._id,
              });

              const crimeElement = {
                ...penalCode,
                ...data,
              };

              setSelectedCode((p) => [...p, crimeElement]);
              setPenalCode([]);
            }}
          />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Penal Code and Elements</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCode &&
            selectedCode.map((v, idx) => (
              <div key={idx} className="mb-4">
                <h3 className="font-bold mb-2">
                  {v.code_number} - {v.narrative}
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  Required Elements:
                </div>
                <ul className="list-disc pl-5">
                  {v.element.map((element, elementIdx) => (
                    <li key={elementIdx}>{element}</li>
                  ))}
                </ul>

                {v.calcrim_example.length > 0 && (
                  <>
                    <div className="text-sm text-gray-600 mt-4 mb-2">
                      CALCRIM Examples:
                    </div>
                    <ul className="list-disc pl-5">
                      {v.calcrim_example.map((example, exampleIdx) => (
                        <li key={exampleIdx}>{example}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <Input
              type="file"
              accept=".txt,.doc,.docx"
              onChange={handleFileUpload}
              className="max-w-xs"
            />
            <Button
              variant="outline"
              onClick={() => setLineNumbers(!lineNumbers)}
            >
              {lineNumbers ? "Hide" : "Show"} Line Numbers
            </Button>
            <div className={cn(!lineNumbers ? "hidden" : "block")}>
              {editorState.getCurrentContent().getBlocksAsArray().length}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <LineNumberEditor
              editorState={editorState}
              onEditorStateChange={setEditorState}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Validation Results</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={(value) => {
              setCaseSelect(value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Case no." />
            </SelectTrigger>
            <SelectContent>
              {getCaseNo?.map((v) => (
                <SelectItem key={v.bookingFormId} value={v.bookingFormId}>
                  {v.caseNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 my-4">
            <Button
              onClick={async () => {
                const results = await validateReport({
                  bookingFormId: caseSelect as Id<"booking">,
                  reportText: editorState.getCurrentContent().getPlainText(),
                  selectedCodes: selectedCode,
                });
                setAnalysisResults(results);
                setSuggestions(null);
                setExample(null);
              }}
            >
              Check
            </Button>
            <Button
              onClick={async () => {
                const suggestions = await suggestImprovements({
                  bookingFormId: caseSelect as Id<"booking">,
                  reportText: editorState.getCurrentContent().getPlainText(),
                  selectedCodes: selectedCode,
                });
                setSuggestions(suggestions);
                setAnalysisResults(null);
                setExample(null);
              }}
            >
              Suggest
            </Button>
            <Button
              onClick={async () => {
                if (selectedCode.length === 0) {
                  alert("Please select at least one penal code");
                  return;
                }
                const example = await generateExample({
                  selectedCodes: selectedCode.map((v) => ({
                    element: v.element,
                    calcrim_example: v.calcrim_example,
                    code_number: v.code_number,
                    narrative: v.narrative,
                  })),
                });
                setExample(example);
                setAnalysisResults(null);
                setSuggestions(null);
              }}
            >
              Example
            </Button>
          </div>

          {analysisResults && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Documentation Analysis</h3>
                <div className="pl-4 border-l-2 border-gray-200">
                  <p className="text-gray-800 mb-2">
                    {analysisResults.documentation.analysis}
                  </p>
                  {analysisResults.documentation.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-semibold">Issues:</p>
                      <ul className="list-disc pl-5">
                        {analysisResults.documentation.issues.map(
                          (issue, i) => (
                            <li key={i} className="text-red-600">
                              {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Legal Standards Compliance
                </h3>
                <div className="pl-4 border-l-2 border-gray-200">
                  <p className="text-gray-800 mb-2">
                    {analysisResults.legalStandards.analysis}
                  </p>
                  {analysisResults.legalStandards.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-semibold">Issues:</p>
                      <ul className="list-disc pl-5">
                        {analysisResults.legalStandards.issues.map(
                          (issue, i) => (
                            <li key={i} className="text-red-600">
                              {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">
                  Court Scrutiny Assessment
                </h3>
                <div className="pl-4 border-l-2 border-gray-200">
                  <p className="text-gray-800 mb-2">
                    {analysisResults.courtScrutiny.analysis}
                  </p>
                  {analysisResults.courtScrutiny.issues.length > 0 && (
                    <div className="mt-2">
                      <p className="text-red-600 font-semibold">Issues:</p>
                      <ul className="list-disc pl-5">
                        {analysisResults.courtScrutiny.issues.map(
                          (issue, i) => (
                            <li key={i} className="text-red-600">
                              {issue}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {suggestions && (
            <div className="space-y-4">
              <h3 className="font-semibold">Suggested Improvements</h3>
              <div className="pl-4 border-l-2 border-gray-200 whitespace-pre-wrap">
                {suggestions}
              </div>
            </div>
          )}

          {example && (
            <div className="space-y-4">
              <h3 className="font-semibold">Example Report</h3>
              <div className="pl-4 border-l-2 border-gray-200 whitespace-pre-wrap">
                {example}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
