"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useMutation, useQueries, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";

export default function IndexCausePage() {
  const [entries, setEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const createCause = useMutation(api.mutation.createCause);
  const getAllCause = useQuery(api.query.getAllCause);
  const deleteCause = useMutation(api.mutation.deleteCause);

  const router = useRouter();

  const filteredCause = getAllCause?.filter((entry) => {
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
            placeholder="Search entries by agency case no. or booking no."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=""
          />
          <Button
            onClick={async () => {
              const id = await createCause();
              router.push(`/cause-form/${id}`);
            }}
          >
            Create Probable Cause
          </Button>
        </div>
        <div className="space-y-2">
          {!getAllCause ? (
            <p>Loading...</p>
          ) : (
            <div>
              {filteredCause?.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 border rounded  flex justify-between items-center mb-4"
                >
                  <div
                    onClick={() => {
                      router.push(`/cause-form/${entry._id}`);
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
                      await deleteCause({
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
