"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Trash } from "lucide-react";
import { useRef, useState } from "react";
import {
  default as ReactSignatureCanvas,
  default as SignatureCanvas,
} from "react-signature-canvas";

export default function SettingsPage() {
  const sigPad = useRef<ReactSignatureCanvas>(null);
  const [userName, setUserName] = useState("");
  const createSignature = useMutation(api.mutation.createSignature);

  const allSignatures = useQuery(api.query.getAllSignature);
  const deleteSignature = useMutation(api.mutation.deleteSignature);

  const clear = () => {
    sigPad.current?.clear();
  };

  const save = async () => {
    if (sigPad.current?.isEmpty() || !userName) {
      alert("Please provide a signature first or a name");
      return;
    }
    const signatureData = sigPad.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    if (!signatureData) {
      return;
    }
    await createSignature({
      name: userName,
      sign: signatureData,
    });
    alert("Signature saved successfully");
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h3 className="text-lg font-medium">Sigature</h3>
        <p className="text-sm text-muted-foreground">
          Place to save your signature
        </p>
      </div>
      <Separator className="w-full" />
      <div className="flex flex-col items-center gap-4 p-4 ">
        <div className="border border-gray-300 rounded">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{
              className: "w-96 h-48 bg-white",
            }}
            // backgroundColor={theme.theme === "dark" ? "#1f2937" : "#f9fafb"}
            clearOnResize={false}
          />
        </div>
        <div className="">
          <Input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Name"
          />
        </div>
        <div className="flex gap-4">
          <button
            onClick={clear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Signature
          </button>
        </div>
      </div>

      <Separator className="w-full" />

      <div>
        <h3 className="text-lg font-medium">Saved Signatures</h3>
        <p className="text-sm text-muted-foreground">
          List of all saved signatures
        </p>

        <div className="flex flex-col gap-4 p-4">
          {allSignatures?.map((signature) => (
            <div
              key={signature._id}
              className="flex items-center justify-between p-4  border shadow-lg   rounded-md"
            >
              <div>
                <span className="text-sm font-medium">
                  {signature.userName}
                </span>
                <img
                  src={signature.base64Sign}
                  alt={signature.userName}
                  className="w-36 h-12 bg-white rounded-md"
                />
              </div>
              <button
                onClick={() => deleteSignature({ id: signature._id })}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                <Trash size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
