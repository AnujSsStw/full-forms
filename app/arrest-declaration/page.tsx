"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IndexArrestDeclarationPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const createArrestDeclaration = useMutation(
    api.mutation.createArrestDeclaration
  );
  const getAllArrestDeclaration = useQuery(api.query.getAllarrestDeclaration);
  const deleteArrestDeclaration = useMutation(
    api.mutation.deleteArrestDeclaration
  );

  const router = useRouter();

  const filteredArrestDeclaration = getAllArrestDeclaration?.filter((entry) => {
    if (!searchTerm) return true;
    return (
      entry.data["agency-case"]
        .toLowerCase()
        .trim()
        .includes(searchTerm.toLowerCase()) ||
      entry.data.booking.toLowerCase().trim().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <main>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 gap-2">
          <Input
            type="search"
            placeholder="Search entries by case no. "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=""
          />
          <Button
            onClick={async () => {
              const id = await createArrestDeclaration();
              router.push(`/arrest-declaration/${id}`);
            }}
          >
            Create Probable Cause
          </Button>
        </div>
        <div className="space-y-2">
          {!getAllArrestDeclaration ? (
            <p>Loading...</p>
          ) : (
            <div>
              {filteredArrestDeclaration?.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 border rounded  flex justify-between items-center mb-4"
                >
                  <div
                    onClick={() => {
                      router.push(`/arrest-declaration/${entry._id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <div>
                      Created At{" "}
                      {new Date(entry._creationTime).toLocaleDateString(
                        "en-US"
                      )}
                    </div>
                    <h1 className="text-2xl">
                      Agency case no.{" "}
                      {entry.data["agency-case"] || "not yet set"}
                    </h1>
                    <p>Arrestee: {entry.data["arrestee"] || "not yet set"}</p>
                  </div>
                  <Button
                    onClick={async () => {
                      await deleteArrestDeclaration({
                        id: entry._id,
                      });
                    }}
                    className="hover:ring-emerald-600 border-blue-600 z-30"
                  >
                    <Trash className="w-6 h-6" color="red" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
