"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PC, PenaltyQueryResult } from "@/convex/pc";
import { PenalCodeSearch } from "@/components/penal-code-search";

// const penalCodes = [
//   {
//     code: "187",
//     description: "Murder",
//     elements: ["Unlawful killing of a human being", "With malice aforethought"],
//   },
//   {
//     code: "211",
//     description: "Robbery",
//     elements: [
//       "Taking of personal property",
//       "From another person or their immediate presence",
//       "Against their will",
//       "By means of force or fear",
//       "With intent to deprive the person of the property permanently",
//     ],
//   },
//   // Add more penal codes as needed
// ];

export function ReportValidator() {
  const [selectedCode, setSelectedCode] = useState<PC[]>([]);
  //   const [report, setReport] = useState("");
  //   const [feedback, setFeedback] = useState("");
  const [penalCodes, setPenalCode] = useState<PenaltyQueryResult>();

  //   const handleCheck = () => {
  //     setFeedback("Report checked. Awaiting implementation of validation logic.");
  //   };

  //   const handleSuggest = () => {
  //     setFeedback(
  //       "Suggestions: Ensure all elements of the crime are addressed in your report."
  //     );
  //   };

  //   const handleCorrect = () => {
  //     setFeedback(
  //       "Corrections: Implement logic to provide specific corrections based on the report and selected penal code."
  //     );
  //   };

  //   const handleExample = () => {
  //     setFeedback(
  //       "Example: On [DATE] at approximately [TIME], suspect John Doe was observed forcibly taking a purse from victim Jane Smith in the 100 block of Main St. The suspect used physical force to overcome the victim's resistance, causing her to fall. The suspect then fled the scene with the purse, which contained the victim's personal belongings."
  //     );
  //   };

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
            handleAddPenalCode={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Penal Code and Elements</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedCode && (
            <div>
              <h3 className="font-bold mb-2">
                {selectedCode} -{" "}
                {
                  penalCodes.find((c) => c.code_number === selectedCode)
                    ?.description
                }
              </h3>
              <ul className="list-disc pl-5">
                {penalCodes
                  .find((c) => c.code === selectedCode)
                  ?.elements.map((element, index) => (
                    <li key={index}>{element}</li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your report here..."
            value={report}
            onChange={(e) => setReport(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Options</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={handleCheck}>Check</Button>
          <Button onClick={handleSuggest}>Suggest</Button>
          <Button onClick={handleCorrect}>Correct</Button>
          <Button onClick={handleExample}>Example</Button>
        </CardContent>
      </Card>

      {feedback && (
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{feedback}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
