"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingFormState } from "@/types/forms";
import { UploadButton } from "@/utils/uploadthing";
import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  AnalyzeOperationOutput,
  AnalyzeResultOutput,
} from "@azure-rest/ai-document-intelligence";
import { Dispatch, SetStateAction, useState } from "react";

type ExtractedLicenseDetails = Pick<
  BookingFormState,
  | "first_name"
  | "last_name"
  | "dob"
  | "drivers_license"
  | "street"
  | "age"
  | "sex"
  | "eyes"
  | "hair"
  | "height"
  | "weight"
>;

export default function ExtractDocDetails({
  setFormData,
}: {
  setFormData: Dispatch<SetStateAction<BookingFormState>>;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [licenseDetails, setLicenseDetails] =
    useState<ExtractedLicenseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractLicenseDetails = async (imageUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize the Document Analysis client
      const endpoint =
        process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT ?? "";
      const key = process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_KEY ?? "";

      if (!endpoint || !key) {
        throw new Error(
          "Azure Document Intelligence credentials are not configured"
        );
      }

      const client = DocumentIntelligence(endpoint, { key });
      // Analyze the document using the URL
      const initialResponse = await client
        .path("/documentModels/{modelId}:analyze", "prebuilt-idDocument")
        .post({
          contentType: "application/json",
          body: {
            urlSource: imageUrl,
          },
        });

      if (isUnexpected(initialResponse)) {
        throw initialResponse.body.error;
      }

      const poller = getLongRunningPoller(client, initialResponse);
      const result = (await poller.pollUntilDone()).body as any;
      const analyzeResult = result.analyzeResult;

      const documents = analyzeResult?.documents;
      const document = documents && documents[0];

      if (!document) {
        throw new Error("No documents found in the analysis");
      }

      // Extract relevant fields based on document type
      if (document.docType === "idDocument.driverLicense") {
        console.log(document.fields);
        const {
          FirstName,
          LastName,
          DocumentNumber,
          DateOfBirth,
          DateOfExpiration,
          Address,
          Sex,
          EyeColor,
          HairColor,
          Height,
          Weight,
        } = document.fields;

        const extractedDetails: ExtractedLicenseDetails = {
          first_name: FirstName?.valueString,
          last_name: LastName?.valueString,
          dob: DateOfBirth?.valueDate,
          drivers_license: DocumentNumber?.valueString,
          street: Address?.valueString,
          sex: Sex?.valueString,
          age: (
            new Date().getFullYear() -
            new Date(DateOfBirth?.valueDate).getFullYear()
          ).toString(),
          eyes: EyeColor?.valueString,
          hair: HairColor?.valueString,
          height: Height?.valueString,
          weight: Weight?.valueString,
        };

        setLicenseDetails(extractedDetails);
      } else {
        throw new Error("Document type is not a driver license");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing the document"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Extract Personal information from driver license
      </h2>

      <div className="space-y-4 ">
        <div className="flex gap-2 justify-center">
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res && res[0]) {
                extractLicenseDetails(res[0].ufsUrl);
              }
            }}
            onUploadError={(error: Error) => {
              setError(`Upload failed: ${error.message}`);
            }}
            appearance={{
              button: {
                background: isLoading ? "bg-gray-400" : "bg-blue-500",
              },
            }}
            disabled={isLoading}
          />
        </div>

        {error && <div className="text-red-500 mt-2">{error}</div>}

        {licenseDetails && (
          <div className="mt-4 space-y-2">
            <h3 className="text-xl font-semibold">Extracted Details:</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(licenseDetails).map(
                ([key, value]) =>
                  value && (
                    <div key={key} className="border p-2 rounded">
                      <span className="font-medium">{key}: </span>
                      <span>{value}</span>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500 mt-2">Loading...</div>
        ) : (
          <Button
            onClick={() => {
              setFormData((p) => ({
                ...p,
                ...licenseDetails,
              }));
            }}
            type="button"
            disabled={!licenseDetails}
          >
            Set Form Data
          </Button>
        )}
      </div>
    </Card>
  );
}
