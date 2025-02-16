"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { fillArrestDeclarationForm } from "./p";

const courtLocations = [
  { name: "BANNING", address: "311 E. Ramsey St., Banning, CA 92220" },
  { name: "MURRIETA", address: "30755-D Auld Rd., Murrieta, CA 92563" },
  { name: "BLYTHE", address: "265 N. Broadway, Blythe, CA 92225" },
  { name: "RIVERSIDE", address: "4100 Main St., Riverside, CA 92501" },
  { name: "INDIO", address: "46-200 Oasis St., Indio, CA 92201" },
];

const initialFormData = {
  courtLocations: [] as string[],
  defendant: "",
  caseNumber: "",
  declarantName: "",
  title: "",
  employedBy: "",
  county: "",
  reportedCrime: "",
  declaration: "",
  sex: "",
  race: "",
  dob: "",
  eyes: "",
  hair: "",
  height: "",
  weight: "",
  cdl: "",
  address: "",
  date: "",
  bail: "",
  attachments: "",
  printName: "",
  judicialDecision: "",
  judicialDate: "",
  judicialName: "",
};

export type ArrestDeclarationFormData = typeof initialFormData;

const ArrestWarrantForm = () => {
  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (locationName: string) => {
    setFormData((prev) => ({
      ...prev,
      courtLocations: prev.courtLocations.includes(locationName)
        ? prev.courtLocations.filter((loc) => loc !== locationName)
        : [...prev.courtLocations, locationName],
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    const pdfbytes = await fillArrestDeclarationForm(formData);
    if (!pdfbytes) return;

    const blob = new Blob([pdfbytes], { type: "application/pdf" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `arrest-declaration-${formData.defendant || "download"}.pdf`; // Set the filename

    // Append to document, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-xl">
          SUPERIOR COURT OF CALIFORNIA, COUNTY OF RIVERSIDE
        </CardTitle>
        <div className="mt-4 space-y-2">
          <Label>Court Locations</Label>
          <div className="grid grid-cols-2 gap-4 ">
            {courtLocations.map((location) => (
              <div
                key={location.name}
                className="flex items-start gap-2 border-b pb-2"
              >
                <input
                  type="checkbox"
                  id={location.name}
                  checked={formData.courtLocations.includes(location.name)}
                  onChange={() => handleLocationChange(location.name)}
                  className="mt-1"
                />
                <Label htmlFor={location.name} className="flex flex-col">
                  <span className="font-medium">{location.name}</span>
                  <span className="text-sm text-gray-500">
                    {location.address}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4">
          DECLARATION IN SUPPORT OF ARREST WARRANT
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defendant">DEFENDANT</Label>
              <Input
                id="defendant"
                name="defendant"
                value={formData.defendant}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caseNumber">CASE NUMBER</Label>
              <Input
                id="caseNumber"
                name="caseNumber"
                value={formData.caseNumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="declarantName">Declarant Name</Label>
              <Input
                id="declarantName"
                name="declarantName"
                value={formData.declarantName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employedBy">Employed By</Label>
              <Input
                id="employedBy"
                name="employedBy"
                value={formData.employedBy}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                name="county"
                value={formData.county}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportedCrime">Reported Crime</Label>
              <Input
                id="reportedCrime"
                name="reportedCrime"
                value={formData.reportedCrime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="declaration">Declaration Statement</Label>
            <Textarea
              id="declaration"
              name="declaration"
              value={formData.declaration}
              onChange={handleChange}
              className="h-32"
              placeholder="Enter declaration statement..."
            />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Input
                id="sex"
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="race">Race</Label>
              <Input
                id="race"
                name="race"
                value={formData.race}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eyes">Eyes</Label>
              <Input
                id="eyes"
                name="eyes"
                value={formData.eyes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hair">Hair</Label>
              <Input
                id="hair"
                name="hair"
                value={formData.hair}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                name="height"
                value={formData.height}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Input
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdl">CDL</Label>
              <Input
                id="cdl"
                name="cdl"
                value={formData.cdl}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border p-2 rounded-md">
              <div className="space-y-2">
                <p className="font-medium text-center">LAW ENFORCEMENT</p>
                <p className="text-sm">
                  I declare, under penalty of perjury under the laws of the
                  State of California that the foregoing is true and correct.
                </p>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printName">Print Name</Label>
                <Input
                  id="printName"
                  name="printName"
                  value={formData.printName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="border p-2 rounded-md">
                <p className="font-medium text-center">JUDICIAL OFFICER</p>
                <div className="flex gap-4 my-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="radio"
                      id="approve"
                      name="judicialDecision"
                      value="approve"
                      onChange={handleChange}
                      checked={formData.judicialDecision === "approve"}
                    />
                    <Label htmlFor="approve">Approve</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="radio"
                      id="disapprove"
                      name="judicialDecision"
                      value="disapprove"
                      onChange={handleChange}
                      checked={formData.judicialDecision === "disapprove"}
                    />
                    <Label htmlFor="disapprove">Disapprove</Label>
                  </div>
                </div>
                <Label htmlFor="bail">Bail Amount</Label>
                <Input
                  id="bail"
                  name="bail"
                  value={formData.bail}
                  onChange={handleChange}
                  placeholder="$"
                />
                <div className="space-y-2 mt-2">
                  <Label htmlFor="judicialDate">Date</Label>
                  <Input
                    id="judicialDate"
                    name="judicialDate"
                    type="date"
                    value={formData.judicialDate}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  <Label htmlFor="judicialName">Print Name</Label>
                  <Input
                    id="judicialName"
                    name="judicialName"
                    value={formData.judicialName}
                    onChange={handleChange}
                    placeholder="Enter judicial officer name"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Textarea
              id="attachments"
              name="attachments"
              value={formData.attachments}
              onChange={handleChange}
              className="w-full"
              rows={10}
              placeholder="Enter attachments..."
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button type="button" variant="outline">
              Clear Form
            </Button>
            <Button type="submit">Submit Declaration</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArrestWarrantForm;
