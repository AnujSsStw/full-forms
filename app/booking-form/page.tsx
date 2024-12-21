"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function IndexBookingPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const createBooking = useMutation(api.mutation.createBooking);
  const getAllBookings = useQuery(api.query.getAllBookings);
  const deleteBooking = useMutation(api.mutation.deleteBooking);

  const router = useRouter();

  const filteredBookings = getAllBookings?.filter((entry) => {
    if (!searchTerm) return true;
    return (
      entry.data.agency_case_number
        .toLowerCase()
        .trim()
        .includes(searchTerm.toLowerCase()) ||
      entry.data.arresting_officer
        .toLowerCase()
        .trim()
        .includes(searchTerm.toLowerCase())
    );
  });

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
              const id = await createBooking();
              router.push(`/booking-form/${id}`);
            }}
          >
            Create Form(500)
          </Button>
        </div>
        <div className="space-y-2">
          {!getAllBookings ? (
            <p>Loading...</p>
          ) : (
            <div>
              {filteredBookings?.map((entry) => (
                <div
                  key={entry._id}
                  className="p-4 mb-3 border rounded flex justify-between items-center gap-3"
                >
                  <Link href={`/booking-form/${entry._id}`}>
                    <h1 className="text-2xl">
                      Case no. {entry.data.agency_case_number || "not yet set"}
                    </h1>
                    <p>
                      Arresting Officer:{" "}
                      {entry.data.arresting_officer || "not yet set"}
                    </p>
                    <p>
                      {entry.causeId ? (
                        <Badge>
                          <Link href={`/cause-form/${entry.causeId}`}>
                            DECLARATION Form Created
                          </Link>
                        </Badge>
                      ) : (
                        <Badge>DECLARATION Form not yet Created</Badge>
                      )}
                    </p>
                  </Link>
                  <Button
                    onClick={async () => {
                      await deleteBooking({ id: entry._id });
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
