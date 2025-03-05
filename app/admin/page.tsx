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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Edit, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

// Sample data for demonstration
const SAMPLE_DATA = [
  {
    id: "1",
    date: "02/19/2025",
    fileNumber: "PE240012345",
    location: "73000 Fred Waring Dr, Palm Desert",
    crimeType: "Domestic Violence",
    submittedBy: "Officer J. Smith",
    status: "Approved",
  },
  {
    id: "2",
    date: "02/19/2025",
    fileNumber: "PE240012346",
    location: "123 Main St, La Quinta",
    crimeType: "Burglary",
    submittedBy: "Officer M. Johnson",
    status: "Pending Review",
  },
  {
    id: "3",
    date: "02/20/2025",
    fileNumber: "PE240012347",
    location: "45600 Portola Ave, Palm Desert",
    crimeType: "Narcotics",
    submittedBy: "Officer R. Williams",
    status: "Approved",
  },
  {
    id: "4",
    date: "02/21/2025",
    fileNumber: "PE240012348",
    location: "789 Desert Way, Indian Wells",
    crimeType: "Theft",
    submittedBy: "Officer T. Brown",
    status: "Needs Correction",
  },
];

const BOOKING_STATUS_MAP = {
  pending: "Pending Review",
  approved: "Approved",
  needs_correction: "Needs Correction",
};

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const data = useQuery(api.query.getBookingsWithUserNames);
  const updateStatus = useMutation(api.mutation.updateBookingStatus);
  const deleteBooking = useMutation(api.mutation.deleteBooking);

  const flattenedData =
    data?.map((booking) => ({
      id: booking.booking._id,
      date: new Date(booking.booking._creationTime).toLocaleDateString(),
      fileNumber: booking.booking.data.agency_case_number,
      location: booking.booking.data.arrest_location,
      crimeType: booking.booking.charges[0]?.narrative || "N/A",
      submittedBy: booking.user || "N/A",
      status:
        BOOKING_STATUS_MAP[
          booking.booking.status as keyof typeof BOOKING_STATUS_MAP
        ] || "N/A",
    })) ?? [];

  const filteredData = flattenedData.filter(
    (item) =>
      item.fileNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (incident: any) => {
    setSelectedIncident(incident);
    setSelectedStatus(incident.status);
    setIsEditDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedIncident || !selectedStatus) return;

    const statusKey = Object.entries(BOOKING_STATUS_MAP).find(
      ([_, value]) => value === selectedStatus
    )?.[0];

    if (statusKey) {
      await updateStatus({
        id: selectedIncident.id,
        status: statusKey as "pending" | "approved" | "needs_correction",
      });
    }

    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (incident: any) => {
    setSelectedIncident(incident);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedIncident) return;

    await deleteBooking({
      id: selectedIncident.id,
    });

    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="min-h-screen  pb-8">
      <main className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Incident Review & Management</CardTitle>
            <CardDescription>
              Review submitted entries for accuracy and manage data corrections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by file number, location, or officer..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>File Number</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Crime Type</TableHead>
                      <TableHead>Submitted By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((incident) => (
                      <TableRow key={incident.id}>
                        <TableCell>{incident.date}</TableCell>
                        <TableCell>{incident.fileNumber}</TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={incident.location}
                        >
                          {incident.location}
                        </TableCell>
                        <TableCell>{incident.crimeType}</TableCell>
                        <TableCell>{incident.submittedBy}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              incident.status === "Approved"
                                ? "default"
                                : incident.status === "Pending Review"
                                  ? "outline"
                                  : "destructive"
                            }
                          >
                            {incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="View"
                              asChild
                            >
                              <Link href={`/booking-form/${incident.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Edit"
                              onClick={() => handleEditClick(incident)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Delete"
                              onClick={() => handleDeleteClick(incident)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Status</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(BOOKING_STATUS_MAP).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleStatusUpdate}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete this booking? This action cannot
                be undone.
              </p>
              <p className="mt-2 font-medium">
                File Number: {selectedIncident?.fileNumber}
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
