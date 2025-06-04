"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
// import { useReport } from '@/hooks/use-report';
// import { ReportFrequency } from '@/lib/types';
import { ReportContent } from "./report-content";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DataModel } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export type ReportFrequency = "weekly" | "monthly" | "yearly";

export function ReportViewer() {
  const [frequency, setFrequency] = useState<ReportFrequency>("weekly");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const fetchReport = useMutation(api.query.getSirReportsForTimeRange);
  const [report, setReport] = useState<DataModel["sir"]["document"][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  //   const { report, fetchReport, isLoading, generatePdf } = useReport();

  const placeholderText = {
    weekly: "Select any date in the week",
    monthly: "Select any date in the month",
    yearly: "Select any date in the year",
  };

  const handleGenerateReport = async () => {
    setIsLoading(true);
    if (!date) return;

    try {
      const reports = await fetchReport({
        frequency,
        date: format(date, "yyyy-MM-dd"),
      });
      setReport(reports);
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!date) return;

    toast.error("Not implemented. Will be implemented in the future.");
    // await generatePdf({
    //   frequency,
    //   date: format(date, "yyyy-MM-dd"),
    // });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-semibold">Generate Report</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Report Frequency</label>
            <Select
              value={frequency}
              onValueChange={(value) => setFrequency(value as ReportFrequency)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Period</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : placeholderText[frequency]}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={handleGenerateReport}
            disabled={!date || isLoading}
            className="flex-1"
          >
            {isLoading ? "Generating..." : "Generate Report"}
          </Button>

          <Button
            variant="outline"
            onClick={handleGeneratePdf}
            disabled={!report || isLoading}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => window.print()}
            disabled={!report}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="print:p-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : report.length > 0 ? (
          <ReportContent report={report} />
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/20">
            <p className="text-muted-foreground">
              Select a frequency and date, then generate a report to view the
              results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
