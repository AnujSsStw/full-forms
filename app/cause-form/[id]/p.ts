import { fillFormFieldWithFittedText } from "@/app/booking-form/[id]/p";
import { RiversideCountySheriffFormData } from "@/types/forms";
import { PDFDocument, PDFTextField, StandardFonts } from "pdf-lib";
import dayjs from "dayjs";

export async function fillCauseForm(
  data: RiversideCountySheriffFormData,
  signatureData: string
) {
  try {
    const response = await fetch(
      "https://healthy-kangaroo-437.convex.cloud/api/storage/ea94a37f-398c-4eec-8129-55e081a090a5"
      // "https://healthy-kangaroo-437.convex.cloud/api/storage/a5f4803a-47dd-4bec-a2aa-8fd830a5f510"
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
    const dob = dayjs(data.dob);
    form.getTextField("DOB").setText(dob.format("MM/DD/YYYY"));
    form.getTextField("Agency Case#").setText(data["agency-case"]);
    form.getTextField("Booking #").setText(data["booking"]);
    form.getTextField("Facility / Fax").setText(data["facility-fax"]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    data.charges.forEach((charge, i) => {
      form.getTextField(`Count${i + 1}`).setText(charge.count.toString());
      fillFormFieldWithFittedText(
        form.getTextField(`Violation Alleged${i + 1}`),
        charge.violation,
        font
      );
      // form.getTextField(`Violation Alleged${i + 1}`).setText(charge.violation);
    });

    // form.getTextField("Count1").setText(data["count-1"]);
    // form.getTextField("Violation Alleged1").setText(data["violation-1"]);
    // form.getTextField("Count2").setText(data["count-2"]);
    // form.getTextField("Violation Alleged2").setText(data["violation-2"]);
    // form.getTextField("Count3").setText(data["count-3"]);
    // form.getTextField("Violation Alleged3").setText(data["violation-3"]);
    // form.getTextField("Count4").setText(data["count-4"]);
    // form.getTextField("Violation Alleged4").setText(data["violation-4"]);

    form.getTextField("Arresting Agency").setText(data["arresting-agency"]);
    form.getTextField("Date").setText(data["arrest-date"]);
    form.getTextField("Time Of Arrest").setText(data["arrest-time"]);
    form
      .getRadioGroup("Group1")
      .select(data["recommended"] === "yes" ? "Choice1" : "Choice2"); // 1 and 2 are the options
    fillFormFieldWithFittedText(
      form.getTextField("Reason"),
      data["reason"],
      font
    );
    // form.getTextField("Reason").setText(data["reason"]);

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

    const probableCause = data["probable-cause"];
    const LIMIT = 400;
    const doesProbableCauseFit = probableCause.length < LIMIT;
    if (doesProbableCauseFit) {
      form.getTextField("Probable Cause").setText(probableCause);
    } else {
      // Find a suitable splitting point
      let splitIndex = probableCause.lastIndexOf(".", LIMIT);

      // If no period found before LIMIT characters, fallback to splitting at 200
      if (splitIndex === -1) {
        splitIndex = probableCause.indexOf(" ", LIMIT);
      }

      // If no space is found either, fallback to hard split
      if (splitIndex === -1) {
        splitIndex = LIMIT;
      }

      const firstPart = probableCause.slice(0, splitIndex + 1).trim(); // Include the period or space
      const secondPart = probableCause.slice(splitIndex + 1).trim();

      form.getTextField("Probable Cause").setText(firstPart);
      form.getTextField("Probable Cause Page 2").setText(secondPart);
      form.getCheckBox("Additional Info on second page").check();
    }

    // if (!data.additional_page_checkbox) {
    //   form.getCheckBox("Additional Info on second page").uncheck();
    // } else {
    //   form.getCheckBox("Additional Info on second page").check();
    // }

    // form.getTextField("Probable Cause").setText(data["probable-cause"]);
    form
      .getTextField("Day and Time of Month")
      .setText(dayjs(data["executedOn"]).format("MM/DD/YYYY"));

    // form.getTextField("digital_signature").setText(data["declarant-signature"]);
    await signature(pdfDoc, signatureData);
    form
      .getTextField("Officer Phone OR Pager")
      .setText(data["arr-officer-phone"]);
    form.getTextField("Agency Fax").setText(data["agency-fax"]);
    form.getTextField("Print Name").setText(data["print-name"]);

    // form.getRadioGroup("Group3").select("Choice1"); // 1-2

    // let r2 = "Choice1";
    // if (data.probable_cause_determination === "is-not") {
    //   r2 = "Choice2";
    // } else if (data.probable_cause_belief === "exists-augmented") {
    //   r2 = "Choice3";
    // }
    // form.getRadioGroup("Group4").select(r2); //1-3
    form.getTextField("Text1").setText(data["by-direction"]);

    // form
    //   .getTextField("Probable Cause Page 2")
    //   .setText(data["additional-info-text"]);

    return await pdfDoc.save({
      updateFieldAppearances: true,
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

async function signature(pdfDoc: PDFDocument, base64Sign: string) {
  try {
    // Convert base64 to Uint8Array
    const signatureData = Buffer.from(base64Sign.split(",")[1], "base64");

    // Embed the PNG signature
    const signatureImage = await pdfDoc.embedPng(signatureData);

    const pages = pdfDoc.getPages();
    const page = pages[0];

    // Draw the signature image on the field
    page.drawImage(signatureImage, {
      x: 53.428 + 30,
      y: 349.301 - 10,
      width: 80,
      height: 40,
    });
  } catch (error) {
    console.error("Error adding signature:", error);
    throw error;
  }
}
