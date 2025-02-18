import dayjs from "dayjs";
import { PDFDocument } from "pdf-lib";
import { ArrestDeclarationFormData } from "./ArrestDeclaration";

export async function fillArrestDeclarationForm(
  data: ArrestDeclarationFormData
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL}/api/storage/${process.env.NEXT_PUBLIC_DECLARATION_ARREST_FORM_ID}`
    );
    const pdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // if some data is missing, use empty string
    (Object.keys(data) as (keyof ArrestDeclarationFormData)[]).forEach(
      (key) => {
        if (!data[key] && typeof data[key] !== "boolean") {
          // @ts-ignore
          data[key] = "" as any;
        }
      }
    );

    data.courtLocations.forEach((courtLocation, index) => {
      form.getCheckBox(`Checkbox.${index}`).check();
    });

    form.getTextField("Text.0.0").setText(data.defendant);
    form.getTextField("Text.0.1").setText(data.caseNumber);
    form.getTextField("Text.1.0").setText(data.declarantName);
    form.getTextField("Text.1.1").setText(data.title);
    form.getTextField("Text.2.0").setText(data.employedBy);
    form.getTextField("Text.2.1").setText(data.county);
    form.getTextField("Text.3.0").setText(data.reportedCrime);
    form.getTextField("Text.3.1").setText(data.declaration);
    form.getTextField("Text.4.1").setText(data.sex);
    form.getTextField("Text.5.0").setText(data.race);
    form.getTextField("Text.5.1").setText(dayjs(data.dob).format("MM/DD/YYYY"));
    form.getTextField("Text.6.0").setText(data.eyes);
    form.getTextField("Text.6.1").setText(data.hair);
    form.getTextField("Text.7.0").setText(data.height);
    form.getTextField("Text.7.1").setText(data.weight);
    form.getTextField("Text.8.0").setText(data.cdl);
    form.getTextField("Text.8.1").setText(data.address);
    form
      .getTextField("Text.9.0")
      .setText(dayjs(data.date).format("MM/DD/YYYY"));
    form.getTextField("Text.9.1").setText(data.printName);
    form.getTextField("Text.10.0").setText(data.bail);
    form
      .getTextField("Text.10.1")
      .setText(dayjs(data.judicialDate).format("MM/DD/YYYY"));
    if (data.judicialDecision === "approve") {
      form.getCheckBox("Checkbox2.1").check();
    } else {
      form.getCheckBox("Checkbox2.1").check();
    }
    form.getTextField("Text.11.0").setText(data.judicialName);
    if (data.attachments.length > 0) {
      form.getCheckBox("Checkbox2.0").check();
    }
    form.getTextField("Text1").setText(data.attachments);

    return await pdfDoc.save({
      updateFieldAppearances: true,
    });
  } catch (err) {
    console.error("Error:", err);
  }
}
