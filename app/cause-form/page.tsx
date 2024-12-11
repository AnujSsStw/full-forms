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

  return (
    <main>
      <div className="p-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 gap-2">
          <Input
            type="search"
            placeholder="Search entries..."
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
          {/* {filteredEntries.map((entry) => (
            <div key={entry.id} className="p-4 border rounded">
              <h3 className="font-bold">{entry.title}</h3>
              <p>{entry.description}</p>
            </div>
          ))} */}

          {!getAllCause ? (
            <p>Loading...</p>
          ) : (
            <div>
              {getAllCause.map((entry) => (
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
                    {JSON.stringify(entry, null, 2)}
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
