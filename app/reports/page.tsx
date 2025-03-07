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
import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import * as XLSX from "xlsx";

applyPlugin(jsPDF);

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

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add title
    doc.setFontSize(16);
    doc.text("Incident Report", 14, 15);

    // Add date range and agency
    doc.setFontSize(12);
    const dateRange = `${format(startDate || new Date(), "MM/dd/yyyy")} - ${format(endDate || new Date(), "MM/dd/yyyy")}`;
    const agencyText =
      agency === "all"
        ? "All Agencies"
        : agency.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase());
    doc.text(`${dateRange} | ${agencyText}`, 14, 25);

    // Prepare table data
    const tableData = reportData.map((incident) => [
      incident.date,
      incident.time,
      incident.fileNumber,
      incident.location,
      incident.crimeType,
      incident.arrestMade,
      incident.suspectName,
      incident.summary,
    ]);

    // Add table with adjusted settings
    (doc as any).autoTable({
      head: [
        [
          "Date",
          "Time",
          "File Number",
          "Location",
          "Crime Type",
          "Arrest Made",
          "Suspect Name",
          "Summary",
        ],
      ],
      body: tableData,
      startY: 35,
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: "linebreak",
        cellWidth: "wrap",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        minCellHeight: 10,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 15 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 35 },
        5: { cellWidth: 15 },
        6: { cellWidth: 30 },
        7: { cellWidth: 85 },
      },
    });

    // Save the PDF
    doc.save(`incident-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = reportData.map((incident) => ({
      Date: incident.date,
      Time: incident.time,
      "File Number": incident.fileNumber,
      Location: incident.location,
      "Crime Type": incident.crimeType,
      "Arrest Made": incident.arrestMade,
      "Suspect Name": incident.suspectName,
      Summary: incident.summary,
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 10 }, // Date
      { wch: 8 }, // Time
      { wch: 15 }, // File Number
      { wch: 30 }, // Location
      { wch: 20 }, // Crime Type
      { wch: 12 }, // Arrest Made
      { wch: 20 }, // Suspect Name
      { wch: 50 }, // Summary
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Incident Report");

    // Save the Excel file
    XLSX.writeFile(
      wb,
      `incident-report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
    );
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
                  onClick={exportToPDF}
                >
                  <FilePdf className="h-4 w-4" />
                  <span>PDF</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={exportToExcel}
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
