"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { RiversideCountySheriffFormData } from "@/types/forms";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { fillCauseForm } from "./p";
import { ProbableCause } from "./probable-cause";
import { CauseFormIdSuggestion } from "./Suggestion";
import Link from "next/link";

const defaultFormState: RiversideCountySheriffFormData = {
  // Basic Information
  "jail-location": "",
  arrestee: "",
  arrestee_info: "",
  dob: "",
  "agency-case": "",
  booking: "",
  "facility-fax": "",

  // Counts and Violations
  charges: [],
  // "count-1": "",
  // "count-2": "",
  // "count-3": "",
  // "count-4": "",
  // "violation-1": "",
  // "violation-2": "",
  // "violation-3": "",
  // "violation-4": "",

  // Arrest Details
  "arresting-agency": "",
  "arrest-date": "",
  "arrest-time": "",
  recommended: "no",
  reason: "",

  // Warrant Information
  "probable-cause-radio": "arrest-warrant",

  // Victim Information
  "victim-age": "",
  "victim-relationship": "",
  "victim-injuries": "",

  // Contraband Information
  contraband: "",
  quantity: "",

  executedOn: "",

  // Probable Cause
  "probable-cause": "",
  // "additional-info-text": "",

  // additional_page_checkbox: false,

  // Declaration Information
  "declarant-signature": "",
  "arr-officer-phone": "",
  "agency-fax": "",
  "print-name": "",

  // Determination
  probable_cause_determination: "",
  probable_cause_belief: "",

  // Magistrate Information
  "magistrate-date": "",
  "magistrate-time": "",
  "magistrate-signature": "",
  "by-direction": "",
};

// Blythe,Cois M.,JBDC,Larry D.,RPDC
const JAILS = ["Blythe", "Cois M.", "JBDC", "Larry D.", "RPDC"];

export function RiversideCountySheriffForm({
  id,
  data,
  firstMsgId,
}: {
  id: string;
  data: any;
  firstMsgId: string;
}) {
  const [formData, setFormData] =
    useState<RiversideCountySheriffFormData>(defaultFormState);
  const formRef = useRef<HTMLFormElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  const updateCauseEntry = useMutation(api.mutation.updateCause);
  const signatures = useQuery(api.query.getSignature);
  // const causeForm = useQuery(api.query.getBookingById, { id });

  useEffect(() => {
    if (data) {
      setFormData((p) => ({ ...p, ...data.data }));
      setMounted(true);
    }
  }, [data]);

  const debouncedCause = useDebouncedCallback(async (value) => {
    try {
      await updateCauseEntry({ id, data: value });
      console.info("Cause updated:", value);
    } catch (error) {
      console.log(value);
      console.error("Error updating cause:", error);
    }
  }, 1000);

  if (!mounted) return <p>Loading...</p>;

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: newValue,
      };

      debouncedCause(newData);
      return newData;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const sign = signatures?.find(
      (sign) => sign._id === formData["declarant-signature"]
    );
    if (!sign && formData["declarant-signature"] !== "none") {
      alert("Please select a signature");
      return;
    }
    const pdfbytes = await fillCauseForm(
      formData,
      sign?.base64Sign || formData["declarant-signature"]
    );
    if (!pdfbytes) return;

    const blob = new Blob([pdfbytes], { type: "application/pdf" });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = url;
    link.download = `cause-form-${formData["arrestee"] || "download"}.pdf`; // Set the filename

    // Append to document, click, and cleanup
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(url);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-8 max-w-6xl mx-auto p-4"
    >
      <Card>
        <CardHeader className="flex items-center">
          <CardTitle className="text-2xl font-bold text-center">
            RIVERSIDE COUNTY SHERIFF DECLARATION AND DETERMINATION
          </CardTitle>
          <CardDescription>
            (PROBABLE CAUSE FOR WARRANTLESS ARREST)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arrestee-info">Arrestee information:</Label>
              <Input
                id="arrestee_info"
                name="arrestee_info"
                value={formData["arrestee_info"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="jail-location">JAIL Location:</Label>
              <Select
                value={formData["jail-location"]}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "jail-location", value },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Jail" />
                </SelectTrigger>
                <SelectContent>
                  {JAILS.map((jail) => (
                    <SelectItem value={jail}>{jail}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* <Input
                id="jail-location"
                name="jail-location"
                value={formData["jail-location"]}
                onChange={handleInputChange}
              /> */}
            </div>
            <div>
              <Label htmlFor="arrestee">ARRESTEE:</Label>
              <Input
                id="arrestee"
                name="arrestee"
                value={formData.arrestee}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="dob">DOB:</Label>
              <Input
                id="dob"
                name="dob"
                type="date"
                value={formData["dob"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="agency-case">AGENCY CASE #:</Label>
              <Input
                id="agency-case"
                name="agency-case"
                value={formData["agency-case"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="booking">BOOKING #:</Label>
              <Input
                id="booking"
                name="booking"
                value={formData["booking"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="facility-fax">FACILITY/FAX:</Label>
              <Input
                id="facility-fax"
                name="facility-fax"
                value={formData["facility-fax"]}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {[1, 2, 3, 4].map((count) => (
            <div key={count} className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`count-${count}`}>Count {count}:</Label>
                <Input
                  id={`count-${count}`}
                  name={`count-${count}`}
                  value={formData.charges[count - 1]?.count || ""}
                  onChange={(e) => {
                    const { name, value } = e.target;
                    setFormData((prevData) => {
                      const newCharges = [...prevData.charges];
                      newCharges[count - 1] = {
                        ...newCharges[count - 1],
                        count: value,
                      };

                      debouncedCause({
                        ...prevData,
                        charges: newCharges,
                      });
                      return { ...prevData, charges: newCharges };
                    });
                  }}
                />
              </div>
              <div>
                <Label htmlFor={`violation-${count}`}>Violation Alleged:</Label>
                <Input
                  id={`violation-${count}`}
                  name={`violation-${count}`}
                  value={formData.charges[count - 1]?.violation || ""}
                  onChange={((count) => (e) => {
                    const { name, value } = e.target;
                    setFormData((prevData) => {
                      const newCharges = [...prevData.charges];
                      newCharges[count - 1] = {
                        ...newCharges[count - 1],
                        violation: value,
                      };

                      debouncedCause({
                        ...prevData,
                        charges: newCharges,
                      });
                      return { ...prevData, charges: newCharges };
                    });
                  })(count)}
                />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arresting-agency">Arresting Agency:</Label>
              <Input
                id="arresting-agency"
                name="arresting-agency"
                value={formData["arresting-agency"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="arrest-date">Date:</Label>
              <Input
                id="arrest-date"
                name="arrest-date"
                type="date"
                value={formData["arrest-date"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="arrest-time">Time of Arrest:</Label>
              <Input
                id="arrest-time"
                name="arrest-time"
                type="time"
                value={formData["arrest-time"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Or Recommended:</Label>
              <RadioGroup
                className="flex space-x-4"
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "recommended", value },
                  });
                }}
                value={formData.recommended}
                name="recommended"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="recommended-yes" />
                  <Label htmlFor="recommended-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="recommended-no" />
                  <Label htmlFor="recommended-no">No</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div>
            <Label htmlFor="reason">Reason:</Label>
            <Input
              id="reason"
              name="reason"
              value={formData["reason"]}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <Label>
              Probable Cause Hearing NOT required for the following reasons:
            </Label>
            <RadioGroup
              className="flex space-x-4 mt-2"
              onValueChange={(value) => {
                handleInputChange({
                  target: { name: "probable-cause-radio", value },
                });
              }}
              value={formData["probable-cause-radio"]}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="arrest-warrant" value="arrest-warrant" />
                <Label htmlFor="arrest-warrant">Arrest Warrant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="bench-warrant" value="bench-warrant" />
                <Label htmlFor="bench-warrant">Bench Warrant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem id="parole-hold" value="parole-hold" />
                <Label htmlFor="parole-hold">Parole Hold</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              FACTS ESTABLISHING ELEMENTS OF CRIME AND IDENTIFICATION
            </h3>
            <div>
              <Label htmlFor="victim-age">Victim(s) Age:</Label>
              <Input
                id="victim-age"
                name="victim-age"
                value={formData["victim-age"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="victim-relationship">
                Victim(s) Relationship To Arrestee:
              </Label>
              <Input
                id="victim-relationship"
                name="victim-relationship"
                value={formData["victim-relationship"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="victim-injuries">Victim(s) Injuries:</Label>
              <Textarea
                id="victim-injuries"
                name="victim-injuries"
                value={formData["victim-injuries"]}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contraband">CONTRABAND DESCRIBED AS:</Label>
              <Input
                id="contraband"
                name="contraband"
                value={formData["contraband"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="quantity">QUANTITY:</Label>
              <Input
                id="quantity"
                name="quantity"
                value={formData["quantity"]}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <ProbableCause
              value={formData["probable-cause"]}
              handleInputChange={handleInputChange}
              label="I deem that there is probable cause to believe that the crime(s) as described have been committed by the arrestee:"
            />
          </div>

          <div>
            <CauseFormIdSuggestion
              data={formData}
              sessionId={id}
              firstMsgId={firstMsgId}
              handleCauseFom={(data) =>
                handleInputChange({
                  target: {
                    name: "probable-cause",
                    value: data,
                  },
                })
              }
            />
          </div>

          {/* <div className="flex items-center space-x-2">
            <Checkbox
              id="additional_page_checkbox"
              name="additional_page_checkbox"
              checked={formData.additional_page_checkbox}
              onCheckedChange={(checked) => {
                handleInputChange({
                  target: {
                    name: "additional_page_checkbox",
                    checked,
                    type: "checkbox",
                  },
                });
              }}
            />
            <Label htmlFor="additional-info">
              Additional information on the 2nd page. (Two Page Limit).
            </Label>
          </div> */}

          {/* {formData["additional_page_checkbox"] && (
            <div>
              <Label htmlFor="additional-info-text">
                Additional Information:
              </Label>
              <Textarea
                id="additional-info-text"
                name="additional-info-text"
                className="mt-2"
                rows={10}
                value={formData["additional-info-text"]}
                onChange={handleInputChange}
              />
            </div>
          )} */}

          <div className="space-y-4">
            <p>
              I declare under penalty of perjury that the foregoing is true and
              correct to the best of my information and belief.
            </p>
            <p className="flex items-center gap-2">
              Executed on,
              <span className="">
                <Input
                  id="executedOn"
                  name="executedOn"
                  type="date"
                  value={formData["executedOn"]}
                  onChange={handleInputChange}
                  className="w-min"
                />
              </span>
              in the County of Riverside, State of California by:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="declarant-signature">
                  Declarant's Signature & ID #:
                </Label>
                <Select
                  value={formData["declarant-signature"]}
                  onValueChange={(value) => {
                    handleInputChange({
                      target: { name: "declarant-signature", value },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Signature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {signatures?.map((sign) => (
                      <SelectItem value={sign._id}>{sign.userName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <h3 className="text-sm font-normal text-gray-500">
                  Create your sign{" "}
                  <Link
                    className="underline text-gray-500 hover:text-gray-700"
                    href="/settings"
                  >
                    here
                  </Link>
                  .
                </h3>

                {/* <Input
                  id="declarant-signature"
                  name="declarant-signature"
                  value={formData["declarant-signature"]}
                  onChange={handleInputChange}
                /> */}
              </div>
              <div>
                <Label htmlFor="arr-officer-phone">
                  Arr. Officer Phone / Pager #:
                </Label>
                <Input
                  id="arr-officer-phone"
                  name="arr-officer-phone"
                  value={formData["arr-officer-phone"]}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="agency-fax">Agency Fax:</Label>
                <Input
                  id="agency-fax"
                  name="agency-fax"
                  value={formData["agency-fax"]}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="print-name">Print Name:</Label>
                <Input
                  id="print-name"
                  name="print-name"
                  value={formData["print-name"]}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          {/* 
          <div className="space-y-4">
            <p>
              On the basis of the foregoing Declaration, I hereby determine that
              there:
            </p>
            <RadioGroup
              defaultValue="is"
              onValueChange={(value) => {
                handleInputChange({
                  target: { name: "probable_cause_determination", value },
                });
              }}
              disabled
              value={formData.probable_cause_determination}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="is" id="is-probable-cause" />
                <Label htmlFor="is-probable-cause">IS</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="is-not" id="is-not-probable-cause" />
                <Label htmlFor="is-not-probable-cause">IS NOT</Label>
              </div>
            </RadioGroup>
            <p>
              Probable Cause to believe this arrestee has committed a crime.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="magistrate-date">Date:</Label>
              <Input
                id="magistrate-date"
                name="magistrate-date"
                type="date"
                value={formData["magistrate-date"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="magistrate-time">Time:</Label>
              <Input
                id="magistrate-time"
                name="magistrate-time"
                type="time"
                value={formData["magistrate-time"]}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="magistrate-signature">
                Magistrate's Signature:
              </Label>
              <Input
                id="magistrate-signature"
                name="magistrate-signature"
                value={formData["magistrate-signature"]}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p>Probable Cause to believe arrested person committed a crime:</p>
            <RadioGroup
              value={formData.probable_cause_belief}
              onValueChange={(value) => {
                handleInputChange({
                  target: { name: "probable_cause_belief", value },
                });
              }}
              defaultValue="exists"
              disabled
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exists" id="exists" />
                <Label htmlFor="exists">Exists as it appears</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="exists-augmented"
                  id="exists-augmented"
                />
                <Label htmlFor="exists-augmented">
                  Exists as augmented by additional information
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-shown" id="not-shown" />
                <Label htmlFor="not-shown">Not Shown</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="by-direction">By Direction:</Label>
            <Input
              id="by-direction"
              name="by-direction"
              placeholder="(Telephonic Approval / Employee Name)"
              value={formData["by-direction"]}
              onChange={handleInputChange}
            />
          </div> */}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit Form
      </Button>
    </form>
  );
}
