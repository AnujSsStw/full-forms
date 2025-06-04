import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataModel } from "@/convex/_generated/dataModel";

interface ReportContentProps {
  report: DataModel["sir"]["document"][];
}

export function ReportContent({ report }: ReportContentProps) {
  // Combine all activities from all reports
  const allActivities = report.flatMap((r) => r.activities);
  const reportDate = report[0]?.date || "";

  return (
    <div className="space-y-6" id="report-content">
      <div className="text-center py-4 border-b">
        <h1 className="text-2xl font-bold">Situational Incident Report</h1>
        <p className="text-muted-foreground">{reportDate}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="font-medium">Date:</dt>
              <dd>{reportDate}</dd>
              <dt className="font-medium">Total Incidents:</dt>
              <dd>{allActivities.length}</dd>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          {allActivities.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Incident Type</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Subject Info</TableHead>
                    <TableHead>File #</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActivities.map((entry, index) => (
                    <TableRow
                      key={index}
                      className="group cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>{entry.event_time}</TableCell>
                      <TableCell>
                        {entry.incident_type || entry.penal_code.narrative}
                      </TableCell>
                      <TableCell>{entry.city}</TableCell>
                      <TableCell>{entry.location}</TableCell>
                      <TableCell>{entry.subject_info}</TableCell>
                      <TableCell>{entry.file_number || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No incidents reported for this period
            </p>
          )}
        </CardContent>
      </Card>

      {allActivities.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detailed Narratives</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {allActivities.map((entry, index) => (
                <div key={index} className="border-b pb-4 last:border-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                    <div>
                      <span className="font-medium block">Time:</span>
                      {entry.event_time}
                    </div>
                    <div>
                      <span className="font-medium block">Incident Type:</span>
                      {entry.incident_type || entry.penal_code.narrative}
                    </div>
                    <div>
                      <span className="font-medium block">Location:</span>
                      {entry.location}, {entry.city}
                    </div>
                    <div>
                      <span className="font-medium block">File #:</span>
                      {entry.file_number || "N/A"}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium block mb-1">
                      Subject Information:
                    </span>
                    <p className="text-sm">{entry.subject_info}</p>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium block mb-1">Narrative:</span>
                    <p className="text-sm whitespace-pre-line">
                      {entry.narrative}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
