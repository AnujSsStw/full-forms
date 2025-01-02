import MarkdownRenderer from "@/components/markdown-render";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ReportAnalysis } from "@/convex/serve";
import { useAction } from "convex/react";
import { useState } from "react";
import { SELECTCODE } from "./ReportValidator";

export function ValidationResults({
  text,
  selectedCode,
  caseSelect,
}: {
  text: string;
  selectedCode: SELECTCODE[];
  caseSelect: any;
}) {
  const [analysisResults, setAnalysisResults] = useState<ReportAnalysis | null>(
    null
  );
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [example, setExample] = useState<string | null>(null);
  const [correction, setCorrection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateReport = useAction(api.serve.validateReport);
  const generateExample = useAction(api.serve.generateExample);
  const suggestImprovements = useAction(api.serve.suggestImprovements);
  const reportCorrection = useAction(api.serve.correction);

  async function handleButtonClick({
    type,
  }: {
    type: "validate" | "example" | "suggest" | "correct";
  }) {
    setLoading(true);
    switch (type) {
      case "correct":
        const c = await reportCorrection({
          text,
        });
        setExample(null);
        setAnalysisResults(null);
        setSuggestions(null);
        if (typeof c === "string") {
          setCorrection(c);
        } else {
          const text = c
            .map((v) => {
              if (v.content[0].type === "text") {
                return v.content[0].text.value;
              } else return "";
            })
            .join("\n\n");

          setCorrection(text);
        }
        break;
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
          text,
        });
        setExample(example);
        setAnalysisResults(null);
        setSuggestions(null);
        setCorrection(null);
        break;

      case "suggest":
        const suggestions = await suggestImprovements({
          bookingFormId: caseSelect ? (caseSelect as Id<"booking">) : undefined,
          reportText: text,
          selectedCodes: selectedCode || undefined,
        });
        setSuggestions(suggestions);
        setAnalysisResults(null);
        setExample(null);
        setCorrection(null);
        break;

      case "validate":
        const results = await validateReport({
          bookingFormId: caseSelect ? (caseSelect as Id<"booking">) : undefined,
          reportText: text,
          selectedCodes: selectedCode || undefined,
        });
        setAnalysisResults(results);
        setSuggestions(null);
        setExample(null);
        setCorrection(null);
        break;

      default:
        break;
    }
    setLoading(false);
  }
  return (
    <div>
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
        <Button
          onClick={async () => {
            await handleButtonClick({ type: "correct" });
          }}
        >
          Correction
        </Button>
      </div>

      {loading
        ? "loading..."
        : analysisResults && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Documentation Analysis</h3>
                <div className="pl-4 border-l-2 border-gray-200">
                  {analysisResults.documentationAnalysis.strengths.length >
                    0 && (
                    <div className="mb-4">
                      <p className="text-green-600 font-semibold">Strengths:</p>
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
                      <p className="text-red-600 font-semibold">Weaknesses:</p>
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
                <h3 className="font-semibold mb-2">Legal Elements Analysis</h3>
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
                  {analysisResults.legalElements.missingElements.length > 0 && (
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
                  {analysisResults.legalElements.recommendations.length > 0 && (
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
                <h3 className="font-semibold mb-2">Investigative Quality</h3>
                <div className="pl-4 border-l-2 border-gray-200">
                  {analysisResults.investigativeQuality.completedSteps.length >
                    0 && (
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
                  {analysisResults.investigativeQuality.missingSteps.length >
                    0 && (
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
                  {analysisResults.investigativeQuality.recommendations.length >
                    0 && (
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
                  {analysisResults.courtPreparation.strengths.length > 0 && (
                    <div className="mb-4">
                      <p className="text-green-600 font-semibold">Strengths:</p>
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
                  {analysisResults.overallAssessment.nextSteps.length > 0 && (
                    <div>
                      <p className="text-blue-600 font-semibold">Next Steps:</p>
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
      {loading
        ? "loading..."
        : correction && (
            <div className="space-y-4">
              <h3 className="font-semibold">Corrections</h3>
              <div className="pl-4 border-l-2 border-gray-200 whitespace-pre-wrap">
                <MarkdownRenderer content={correction} />
              </div>
            </div>
          )}
    </div>
  );
}
