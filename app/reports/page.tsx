"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  FileSpreadsheet,
  FileIcon as FilePdf,
  Loader2,
} from "lucide-react";
import { ARRESTING_AGENCY } from "../booking-form/[id]/BookingForm";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Sample data for demonstration
const SAMPLE_DATA = [
  {
    date: "02/19/2025",
    time: "14:35",
    fileNumber: "PE240012345",
    location: "73000 Fred Waring Dr, Palm Desert",
    crimeType: "Domestic Violence",
    arrestMade: "Yes",
    suspectName: "Doe, John",
    summary:
      "Deputies responded to a disturbance at 73000 Fred Waring Dr. Upon arrival, they contacted John Doe (DOB: 01/01/1990), who was arrested for PC 243(e)(1) – Domestic Battery. Doe was booked at the Indio Jail.",
  },
  {
    date: "02/19/2025",
    time: "09:10",
    fileNumber: "PE240012346",
    location: "123 Main St, La Quinta",
    crimeType: "Burglary",
    arrestMade: "No",
    suspectName: "N/A",
    summary:
      "Deputies responded to a burglary report at a residence. Unknown suspect(s) forced entry through rear sliding door and stole various electronics and jewelry. Investigation ongoing.",
  },
  {
    date: "02/20/2025",
    time: "22:15",
    fileNumber: "PE240012347",
    location: "45600 Portola Ave, Palm Desert",
    crimeType: "Narcotics",
    arrestMade: "Yes",
    suspectName: "Smith, Jane",
    summary:
      "During a traffic stop, deputies located narcotics in the vehicle. Driver Jane Smith (DOB: 05/15/1985) was arrested for H&S 11350 – Possession of Controlled Substance. Smith was cited and released.",
  },
];

interface ReportData {
  date: string;
  time: string;
  fileNumber: string;
  location: string;
  crimeType: string;
  arrestMade: string;
  suspectName: string;
  summary: string;
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [agency, setAgency] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const reports = useMutation(api.query.getReportsForTimeRange);
  const [reportData, setReportData] = useState<ReportData[]>([]);

  const handleGenerateReport = async () => {
    setLoading(true);
    // pass the date in 2024-12-18T00:45 format
    const startDateString = startDate?.toISOString().split("T")[0];
    const endDateString = endDate?.toISOString().split("T")[0];
    const data = await reports({
      start: startDateString || "",
      end: endDateString || "",
      agency,
    });
    setReportData(
      data.map((d) => {
        //  arrest_time: "2024-12-18T00:45",
        const date = format(new Date(d.booking.data.arrest_time), "MM/dd/yyyy");
        const time = format(new Date(d.booking.data.arrest_time), "HH:mm");

        return {
          date,
          time,
          fileNumber: d.booking.data.agency_case_number,
          location: d.booking.data.arrest_location,
          crimeType:
            d.booking.charges?.map((c) => c.narrative).join(", ") ??
            "Not yet set",
          arrestMade: d.cause === "No cause" ? "No" : "Yes",
          suspectName: `${d.booking.data.last_name}, ${d.booking.data.first_name}`,
          summary: d.cause === "No cause" ? "No cause" : d.cause,
        };
      })
    );
    setReportGenerated(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen  pb-8">
      <main className="container mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search by Date & City</CardTitle>
            <CardDescription>
              Select a date range and city to generate a report of incidents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="startDate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "MM/dd/yyyy")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      id="endDate"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MM/dd/yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label htmlFor="agency">Agency</Label>
                <Select value={agency} onValueChange={setAgency}>
                  <SelectTrigger id="agency">
                    <SelectValue placeholder="Select Agency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {ARRESTING_AGENCY.map((agency) => (
                      <SelectItem key={agency} value={agency}>
                        {agency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={handleGenerateReport}>Generate Report</Button>
            </div>
          </CardContent>
        </Card>

        {loading && !reportGenerated && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {reportGenerated && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Incident Report</CardTitle>
                <CardDescription>
                  {startDate && endDate
                    ? `${format(startDate, "MM/dd/yyyy")} - ${format(endDate, "MM/dd/yyyy")}`
                    : "Date Range"}{" "}
                  |{" "}
                  {agency === "all"
                    ? "All Agencies"
                    : agency
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FilePdf className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Excel</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>File Number</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Crime / Call Type</TableHead>
                        <TableHead>Arrest Made</TableHead>
                        <TableHead>Suspect Name</TableHead>
                        <TableHead className="w-1/4">Summary</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((incident, index) => (
                        <TableRow key={index}>
                          <TableCell>{incident.date}</TableCell>
                          <TableCell>{incident.time}</TableCell>
                          <TableCell>{incident.fileNumber}</TableCell>
                          <TableCell>{incident.location}</TableCell>
                          <TableCell>{incident.crimeType}</TableCell>
                          <TableCell>{incident.arrestMade}</TableCell>
                          <TableCell>{incident.suspectName}</TableCell>
                          <TableCell
                            className="max-w-xs truncate"
                            title={incident.summary}
                          >
                            {incident.summary}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
