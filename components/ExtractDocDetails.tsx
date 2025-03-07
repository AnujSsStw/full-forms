"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookingFormState } from "@/types/forms";
import { UploadButton, uploadFiles } from "@/utils/uploadthing";
import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  AnalyzeOperationOutput,
  AnalyzeResultOutput,
} from "@azure-rest/ai-document-intelligence";
import { Dispatch, SetStateAction, useState, useRef, useEffect } from "react";

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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  // Add function to start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      // If back camera fails, try falling back to any available camera
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (fallbackErr) {
        setError("Failed to access camera");
      }
    }
  };

  // Add this effect to handle video stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err);
        setError("Failed to start video stream");
      });
    }
  }, [stream]);

  // Add function to capture photo
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(async (blob) => {
        if (blob) {
          setIsLoading(true);
          try {
            // Create a File object from the blob
            const file = new File([blob], "license-photo.jpg", {
              type: "image/jpeg",
            });

            // Use the uploadFiles function from uploadthing
            const res = await uploadFiles("imageUploader", {
              files: [file],
            });

            if (res && res[0]) {
              extractLicenseDetails(res[0].ufsUrl);
            }
          } catch (err) {
            setError("Failed to upload captured image");
          } finally {
            setIsLoading(false);
          }
        }
      }, "image/jpeg");
    }

    // Stop the camera stream
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Clean up function for camera stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Extract Personal information from driver license
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2 justify-center flex-col items-center">
          {stream ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md h-auto mb-4 rounded-lg border"
              />
              <Button
                onClick={capturePhoto}
                disabled={isLoading}
                className="mb-2"
              >
                Capture Photo
              </Button>
            </>
          ) : (
            <Button onClick={startCamera} disabled={isLoading} className="mb-2">
              Open Camera
            </Button>
          )}

          <div className="text-center">
            <span className="text-gray-500">- or -</span>
          </div>

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
