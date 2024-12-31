import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PenaltyQueryResult } from "@/convex/pc";

export const PenalCodeSearch = ({
  setPenalCode,
  penalCodes,
  handleAddPenalCode,
}: {
  setPenalCode: Dispatch<SetStateAction<PenaltyQueryResult | undefined>>;
  penalCodes: PenaltyQueryResult | undefined;

  handleAddPenalCode: (idx: number) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [queryByCode, setQueryByCode] = useState(false);

  const q = useAction(api.pc.getPenalty);

  useEffect(() => {
    if (searchTerm.length < 3 && queryByCode === false) return;

    debounced(searchTerm);
  }, [searchTerm]);

  const debounced = useDebouncedCallback(async (value) => {
    const data = await q({ query: value, queryByCode });
    setPenalCode(data);
  }, 1000);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="relative">
        <Input
          type="text"
          id="charges"
          name="charges"
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
          placeholder="Search penal codes..."
          value={searchTerm}
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <input
                  id="queryByCode"
                  name="queryByCode"
                  type="checkbox"
                  onChange={(e) => setQueryByCode(e.target.checked)}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search with penal code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {penalCodes && penalCodes.length > 0 ? (
        <div className="rounded-lg shadow-md max-h-96 overflow-y-auto">
          {penalCodes.map((code, idx) => (
            <div
              key={idx}
              className="cursor-pointer  flex justify-between px-3 border-b last:border-b-0 hover:bg-gray-800"
              onClick={() => {
                handleAddPenalCode(idx);
              }}
            >
              <div>
                <h2 className="text-md font-semibold text-blue-600 mb-1 hover:underline cursor-pointer">
                  {code.codeType} - {code.code_number}
                </h2>
                <p className="text-xs text-gray-600  line-clamp-2">
                  {code.narrative}
                </p>
              </div>
              <span
                className={`text-xs font-medium ${code.m_f === "F" ? "text-red-600" : "text-yellow-600"}`}
              >
                {code.m_f === "F" ? "Felony" : "Misdemeanor"}
              </span>
            </div>
          ))}
        </div>
      ) : penalCodes === undefined && searchTerm !== "" ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No results found for "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  );
};
