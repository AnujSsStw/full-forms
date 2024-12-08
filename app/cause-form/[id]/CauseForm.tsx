"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RiversideCountySheriffForm({}: { id: string }) {
  const [additionalInfo, setAdditionalInfo] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Form Data", formData);
  };

  return (
    <form className="space-y-8 max-w-6xl mx-auto p-4" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            RIVERSIDE COUNTY SHERIFF DECLARATION AND DETERMINATION
            <br />
            (PROBABLE CAUSE FOR WARRANTLESS ARREST)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jail-location">JAIL Location:</Label>
              <Input
                name="jail-location"
                id="jail-location"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="arrestee">ARRESTEE:</Label>
              <Input id="arrestee" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="dob">DOB:</Label>
              <Input id="dob" type="date" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="agency-case">AGENCY CASE #:</Label>
              <Input id="agency-case" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="booking">BOOKING #:</Label>
              <Input id="booking" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="facility-fax">FACILITY/FAX:</Label>
              <Input id="facility-fax" onChange={handleInputChange} />
            </div>
          </div>

          {[1, 2, 3, 4].map((count) => (
            <div key={count} className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`count-${count}`}>Count {count}:</Label>
                <Input id={`count-${count}`} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor={`violation-${count}`}>Violation Alleged:</Label>
                <Input id={`violation-${count}`} onChange={handleInputChange} />
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="arresting-agency">Arresting Agency:</Label>
              <Input id="arresting-agency" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="arrest-date">Date:</Label>
              <Input
                id="arrest-date"
                type="date"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="arrest-time">Time of Arrest:</Label>
              <Input
                id="arrest-time"
                type="time"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Or Recommended:</Label>
              <RadioGroup
                defaultValue="no"
                className="flex space-x-4"
                onValueChange={(value) =>
                  handleInputChange({ target: { name: "recommended", value } })
                }
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
            <Input id="reason" onChange={handleInputChange} />
          </div>

          <div>
            <Label>
              Probable Cause Hearing NOT required for the following reasons:
            </Label>
            <div className="flex space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="arrest-warrant" onChange={handleInputChange} />
                <Label htmlFor="arrest-warrant">Arrest Warrant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="bench-warrant" onChange={handleInputChange} />
                <Label htmlFor="bench-warrant">Bench Warrant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="parole-hold" onChange={handleInputChange} />
                <Label htmlFor="parole-hold">Parole Hold</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              FACTS ESTABLISHING ELEMENTS OF CRIME AND IDENTIFICATION
            </h3>
            <div>
              <Label htmlFor="victim-age">Victim(s) Age:</Label>
              <Input id="victim-age" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="victim-relationship">
                Victim(s) Relationship To Arrestee:
              </Label>
              <Input id="victim-relationship" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="victim-injuries">Victim(s) Injuries:</Label>
              <Textarea id="victim-injuries" onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contraband">CONTRABAND DESCRIBED AS:</Label>
              <Input id="contraband" onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="quantity">QUANTITY:</Label>
              <Input id="quantity" onChange={handleInputChange} />
            </div>
          </div>

          <div>
            <Label htmlFor="probable-cause">
              I deem that there is probable cause to believe that the crime(s)
              as described have been committed by the arrestee:
            </Label>
            <Textarea
              id="probable-cause"
              className="mt-2"
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="additional-info"
              checked={additionalInfo}
              onCheckedChange={(checked) =>
                setAdditionalInfo(checked as boolean)
              }
            />
            <Label htmlFor="additional-info">
              Additional information on the 2nd page. (Two Page Limit).
            </Label>
          </div>

          {additionalInfo && (
            <div>
              <Label htmlFor="additional-info-text">
                Additional Information:
              </Label>
              <Textarea
                id="additional-info-text"
                className="mt-2"
                rows={10}
                onChange={handleInputChange}
              />
            </div>
          )}

          <div className="space-y-4">
            <p>
              I declare under penalty of perjury that the foregoing is true and
              correct to the best of my information and belief.
            </p>
            <p>
              Executed on, in the County of Riverside, State of California by:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="declarant-signature">
                  Declarant's Signature & ID #:
                </Label>
                <Input id="declarant-signature" onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="arr-officer-phone">
                  Arr. Officer Phone / Pager #:
                </Label>
                <Input id="arr-officer-phone" onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="agency-fax">Agency Fax:</Label>
                <Input id="agency-fax" onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="print-name">Print Name:</Label>
                <Input id="print-name" onChange={handleInputChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p>
              On the basis of the foregoing Declaration, I hereby determine that
              there:
            </p>
            <RadioGroup
              defaultValue="is"
              onValueChange={(value) =>
                handleInputChange({
                  target: { name: "probable-cause-1", value },
                })
              }
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
                type="date"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="magistrate-time">Time:</Label>
              <Input
                id="magistrate-time"
                type="time"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="magistrate-signature">
                Magistrate's Signature:
              </Label>
              <Input id="magistrate-signature" onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-4">
            <p>Probable Cause to believe arrested person committed a crime:</p>
            <RadioGroup
              onValueChange={(value) =>
                handleInputChange({
                  target: { name: "probable-cause-2", value },
                })
              }
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
              placeholder="(Telephonic Approval / Employee Name)"
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Submit Form
      </Button>
    </form>
  );
}
