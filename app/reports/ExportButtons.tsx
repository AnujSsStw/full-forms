"use client";

import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileIcon as FilePdf } from "lucide-react";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import * as XLSX from "xlsx";

applyPlugin(jsPDF);

interface ExportButtonsProps {
  reportData: any[];
  startDate: Date | undefined;
  endDate: Date | undefined;
  agency: string;
}

export function ExportButtons({
  reportData,
  startDate,
  endDate,
  agency,
}: ExportButtonsProps) {
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
  );
}
