import { RiversideCountySheriffFormData } from "@/types/forms";
import { PDFDocument } from "pdf-lib";

export async function fillCauseForm(data: RiversideCountySheriffFormData) {
  try {
    const response = await fetch(
      "https://healthy-kangaroo-437.convex.cloud/api/storage/ea94a37f-398c-4eec-8129-55e081a090a5"
    );
    const pdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // if some data is missing, use empty string
    (Object.keys(data) as (keyof RiversideCountySheriffFormData)[]).forEach(
      (key) => {
        if (!data[key] && typeof data[key] !== "boolean") {
          // @ts-ignore
          data[key] = "" as any;
        }
      }
    );

    form.getTextField("Arrest Information").setText(data.arrestee_info);
    form.getTextField("Jail Location").setText(data["jail-location"]);
    form.getTextField("Arrestee").setText(data.arrestee);
    form.getTextField("DOB").setText(data.dob);
    form.getTextField("Agency Case#").setText(data["agency-case"]);
    form.getTextField("Booking #").setText(data["booking"]);
    form.getTextField("Facility / Fax").setText(data["facility-fax"]);

    form.getTextField("Count1").setText(data["count-1"]);
    form.getTextField("Violation Alleged1").setText(data["violation-1"]);
    form.getTextField("Count2").setText(data["count-2"]);
    form.getTextField("Violation Alleged2").setText(data["violation-2"]);
    form.getTextField("Count3").setText(data["count-3"]);
    form.getTextField("Violation Alleged3").setText(data["violation-3"]);
    form.getTextField("Count4").setText(data["count-4"]);
    form.getTextField("Violation Alleged4").setText(data["violation-4"]);

    form.getTextField("Arresting Agency").setText(data["arresting-agency"]);
    form.getTextField("Date").setText(data["arrest-date"]);
    form.getTextField("Time Of Arrest").setText(data["arrest-time"]);
    form
      .getRadioGroup("Group1")
      .select(data["recommended"] === "yes" ? "Choice1" : "Choice2"); // 1 and 2 are the options
    form.getTextField("Reason").setText(data["reason"]);

    // probable cause for hearing
    let r = "Choice1";
    if (data["probable-cause-radio"] === "bench-warrant") {
      r = "Choice2";
    } else if (data["probable-cause-radio"] === "parole-hold") {
      r = "Choice3";
    }
    form.getRadioGroup("Group2").select(r); // 1-3

    form.getTextField("Victim Age").setText(data["victim-age"]);
    form
      .getTextField("Victim Relationship to Arrestee")
      .setText(data["victim-relationship"]);
    form.getTextField("Victim Injuries").setText(data["victim-injuries"]);

    form.getTextField("Contraband").setText(data["contraband"]);
    form.getTextField("Amount of Contraband").setText(data["quantity"]);

    if (!data.additional_page_checkbox) {
      form.getCheckBox("Additional Info on second page").uncheck();
    } else {
      form.getCheckBox("Additional Info on second page").check();
    }

    form.getTextField("Probable Cause").setText(data["probable-cause"]);
    form.getTextField("Day and Time of Month").setText(data["magistrate-date"]);

    form
      .getTextField("Officer Phone OR Pager")
      .setText(data["arr-officer-phone"]);
    form.getTextField("Agency Fax").setText(data["agency-fax"]);
    form.getTextField("Print Name").setText(data["print-name"]);

    form.getRadioGroup("Group3").select("Choice1"); // 1-2

    let r2 = "Choice1";
    if (data.probable_cause_determination === "is-not") {
      r2 = "Choice2";
    } else if (data.probable_cause_belief === "exists-augmented") {
      r2 = "Choice3";
    }
    form.getRadioGroup("Group4").select(r2); //1-3
    form.getTextField("Text1").setText(data["by-direction"]);

    form
      .getTextField("Probable Cause Page 2")
      .setText(data["additional-info-text"]);

    return await pdfDoc.save();
  } catch (err) {
    console.error("Error:", err);
  }
}
