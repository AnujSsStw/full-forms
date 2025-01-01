"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditorState, ContentState } from "draft-js";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { PC, PenaltyQueryResult } from "@/convex/pc";
import { PenalCodeSearch } from "@/components/penal-code-search";
import { LineNumberEditor } from "./LineNumberEditor";
import { cn } from "@/lib/utils";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";

// Dynamically import the Editor to avoid SSR issues
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

export function ReportValidator() {
  const [selectedCode, setSelectedCode] = useState<
    {
      _id: Id<"crimeElement">;
      _creationTime: number;
      pcId: Id<"pc">;
      element: string[];
      calcrim_example: string[];
      code_number: string;
      codeType: string;
      narrative: string;
      m_f: "M" | "F";
    }[]
  >([]);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );
  const [penalCodes, setPenalCode] = useState<PenaltyQueryResult>();
  const [lineNumbers, setLineNumbers] = useState(true);
  const getCrimeElement = useAction(api.serve.crimeElement);

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
  console.log(selectedCode);

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
          <div className="flex gap-2 my-4">
            <Button onClick={console.log}>Check</Button>
            <Button onClick={console.log}>Suggest</Button>
            <Button onClick={console.log}>Correct</Button>
            <Button onClick={console.log}>Example</Button>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Probable Cause Analysis</h3>
              <div className="pl-4 border-l-2 border-gray-200">
                {/* Placeholder for probable cause analysis */}
                <p className="text-gray-600">Analysis pending...</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">
                Beyond Reasonable Doubt Analysis
              </h3>
              <div className="pl-4 border-l-2 border-gray-200">
                {/* Placeholder for BRD analysis */}
                <p className="text-gray-600">Analysis pending...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
