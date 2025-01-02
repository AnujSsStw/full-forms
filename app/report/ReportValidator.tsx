"use client";

import MarkdownRenderer from "@/components/markdown-render";
import { PenalCodeSearch } from "@/components/penal-code-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { PenaltyQueryResult } from "@/convex/pc";
import { ReportAnalysis } from "@/convex/serve";
import { cn } from "@/lib/utils";
import { useAction, useQuery } from "convex/react";
import { ContentState, EditorState } from "draft-js";
import mammoth from "mammoth";
import { useState } from "react";
import { TextEditor } from "./LineNumberEditor";

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
  const [analysisResults, setAnalysisResults] = useState<ReportAnalysis | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateReport = useAction(api.serve.validateReport);
  const generateExample = useAction(api.serve.generateExample);
  const suggestImprovements = useAction(api.serve.suggestImprovements);

  async function handleButtonClick({
    type,
  }: {
    type: "validate" | "example" | "suggest";
  }) {
    setLoading(true);
    switch (type) {
      case "example":
        if (selectedCode.length === 0) {
          alert("Please select at least one penal code");
          setLoading(false);
          return;
        }
        const example = await generateExample({
          selectedCodes: selectedCode.map((v) => ({
            element: v.element,
            calcrim_example: v.calcrim_example,
            code_number: v.code_number,
            narrative: v.narrative,
          })),
          text: editorState.getCurrentContent().getPlainText(),
        });
        setExample(example);
        setAnalysisResults(null);
        setSuggestions(null);
        break;

      case "suggest":
        const suggestions = await suggestImprovements({
          bookingFormId: caseSelect ? (caseSelect as Id<"booking">) : undefined,
          reportText: editorState.getCurrentContent().getPlainText(),
          selectedCodes: selectedCode || undefined,
        });
        setSuggestions(suggestions);
        setAnalysisResults(null);
        setExample(null);
        break;

      case "validate":
        const results = await validateReport({
          bookingFormId: caseSelect ? (caseSelect as Id<"booking">) : undefined,
          reportText: editorState.getCurrentContent().getPlainText(),
          selectedCodes: selectedCode || undefined,
        });
        setAnalysisResults(results);
        setSuggestions(null);
        setExample(null);
        break;

      default:
        break;
    }
    setLoading(false);
  }

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      let text = "";

      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        text = result.value;
      } else {
        // Fallback for txt files
        const reader = new FileReader();
        text = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsText(file);
        });
      }

      const contentState = ContentState.createFromText(text);
      const newEditorState = EditorState.createWithContent(contentState);
      setEditorState(newEditorState);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Error processing file. Please try again.");
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
            <TextEditor
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
                await handleButtonClick({ type: "validate" });
              }}
            >
              Check
            </Button>
            <Button
              onClick={async () => {
                await handleButtonClick({ type: "suggest" });
              }}
            >
              Suggest
            </Button>
            <Button
              onClick={async () => {
                await handleButtonClick({ type: "example" });
              }}
            >
              Example
            </Button>
          </div>

          {loading
            ? "loading..."
            : analysisResults && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">
                      Documentation Analysis
                    </h3>
                    <div className="pl-4 border-l-2 border-gray-200">
                      {analysisResults.documentationAnalysis.strengths.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-green-600 font-semibold">
                            Strengths:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.documentationAnalysis.strengths.map(
                              (item, i) => (
                                <li key={i} className="text-green-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.documentationAnalysis.weaknesses.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-red-600 font-semibold">
                            Weaknesses:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.documentationAnalysis.weaknesses.map(
                              (item, i) => (
                                <li key={i} className="text-red-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.documentationAnalysis.recommendations
                        .length > 0 && (
                        <div>
                          <p className="text-blue-600 font-semibold">
                            Recommendations:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.documentationAnalysis.recommendations.map(
                              (item, i) => (
                                <li key={i} className="text-blue-600">
                                  {item}
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
                      Legal Elements Analysis
                    </h3>
                    <div className="pl-4 border-l-2 border-gray-200">
                      {analysisResults.legalElements.satisfiedElements.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-green-600 font-semibold">
                            Satisfied Elements:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.legalElements.satisfiedElements.map(
                              (item, i) => (
                                <li key={i} className="text-green-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.legalElements.missingElements.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-red-600 font-semibold">
                            Missing Elements:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.legalElements.missingElements.map(
                              (item, i) => (
                                <li key={i} className="text-red-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.legalElements.recommendations.length >
                        0 && (
                        <div>
                          <p className="text-blue-600 font-semibold">
                            Recommendations:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.legalElements.recommendations.map(
                              (item, i) => (
                                <li key={i} className="text-blue-600">
                                  {item}
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
                      Investigative Quality
                    </h3>
                    <div className="pl-4 border-l-2 border-gray-200">
                      {analysisResults.investigativeQuality.completedSteps
                        .length > 0 && (
                        <div className="mb-4">
                          <p className="text-green-600 font-semibold">
                            Completed Steps:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.investigativeQuality.completedSteps.map(
                              (item, i) => (
                                <li key={i} className="text-green-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.investigativeQuality.missingSteps
                        .length > 0 && (
                        <div className="mb-4">
                          <p className="text-red-600 font-semibold">
                            Missing Steps:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.investigativeQuality.missingSteps.map(
                              (item, i) => (
                                <li key={i} className="text-red-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.investigativeQuality.recommendations
                        .length > 0 && (
                        <div>
                          <p className="text-blue-600 font-semibold">
                            Recommendations:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.investigativeQuality.recommendations.map(
                              (item, i) => (
                                <li key={i} className="text-blue-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Court Preparation</h3>
                    <div className="pl-4 border-l-2 border-gray-200">
                      {analysisResults.courtPreparation.strengths.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-green-600 font-semibold">
                            Strengths:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.courtPreparation.strengths.map(
                              (item, i) => (
                                <li key={i} className="text-green-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.courtPreparation.vulnerabilities.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-red-600 font-semibold">
                            Vulnerabilities:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.courtPreparation.vulnerabilities.map(
                              (item, i) => (
                                <li key={i} className="text-red-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.courtPreparation.recommendations.length >
                        0 && (
                        <div>
                          <p className="text-blue-600 font-semibold">
                            Recommendations:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.courtPreparation.recommendations.map(
                              (item, i) => (
                                <li key={i} className="text-blue-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Overall Assessment</h3>
                    <div className="pl-4 border-l-2 border-gray-200">
                      <p className="text-gray-800 mb-2">
                        Report Score:{" "}
                        {analysisResults.overallAssessment.reportScore}/100
                      </p>
                      {analysisResults.overallAssessment.primaryIssues.length >
                        0 && (
                        <div className="mb-4">
                          <p className="text-red-600 font-semibold">
                            Primary Issues:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.overallAssessment.primaryIssues.map(
                              (item, i) => (
                                <li key={i} className="text-red-600">
                                  {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      {analysisResults.overallAssessment.nextSteps.length >
                        0 && (
                        <div>
                          <p className="text-blue-600 font-semibold">
                            Next Steps:
                          </p>
                          <ul className="list-disc pl-5">
                            {analysisResults.overallAssessment.nextSteps.map(
                              (item, i) => (
                                <li key={i} className="text-blue-600">
                                  {item}
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

          {loading
            ? "loading..."
            : suggestions && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Suggested Improvements</h3>
                  <div className="pl-4 border-l-2 border-gray-200 whitespace-pre-wrap">
                    <MarkdownRenderer content={suggestions} />
                    {/* {suggestions} */}
                  </div>
                </div>
              )}

          {loading
            ? "loading..."
            : example && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Example Report</h3>
                  <div className="pl-4 border-l-2 border-gray-200 whitespace-pre-wrap">
                    <MarkdownRenderer content={example} />
                  </div>
                </div>
              )}
        </CardContent>
      </Card>
    </div>
  );
}
