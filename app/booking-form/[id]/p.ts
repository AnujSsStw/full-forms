import { BookingFormState, FormEntry } from "@/types/forms";
import { PDFDocument } from "pdf-lib";
import dayjs from "dayjs";

export async function fillBookingForm(data: {
  formData: BookingFormState;
  charges: FormEntry[];
}) {
  try {
    const response = await fetch(
      "https://healthy-kangaroo-437.convex.cloud/api/storage/b220244c-0754-4b56-bc7a-4dacb1b2226f"
    );
    const pdfBytes = await response.arrayBuffer();

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();

    // if some data is missing, use empty string
    (Object.keys(data.formData) as (keyof BookingFormState)[]).forEach(
      (key) => {
        if (!data.formData[key] && typeof data.formData[key] !== "boolean") {
          // @ts-ignore
          data.formData[key] = "" as any;
        }
      }
    );

    const allFields = {
      arrest_time: form.getTextField("Arrest Time"),
      booking_date_time: form.getTextField("Booking Date and Time"),
      arrest_date: form.getTextField("Arrest Date"),
      booking_number: form.getTextField("Booking Number"),

      defendant_information: form.getTextField("DEFENDANT INFORMATION"),
      street: form.getTextField("Street"),
      city: form.getTextField("City"),
      state: form.getTextField("State"),
      zip: form.getTextField("Zip"),
      phone: form.getTextField("Phone"),
      sex: form.getTextField("Sex"),
      race: form.getTextField("Race"),
      dob: form.getTextField("DOB"),
      age: form.getTextField("Age"),
      height: form.getTextField("Height"),
      weight: form.getTextField("Weight"),
      hair: form.getTextField("Hair"),
      eyes: form.getTextField("Eyes"),
      place_of_birth: form.getTextField("Place of Birth"),
      ssn: form.getTextField("SSN"),
      employer: form.getTextField("Employer"),
      occupation: form.getTextField("Occupation"),
      group1: form.getRadioGroup("Group1"),
      other_names_used: form.getTextField("Other Names Used"),
      emergency_contact: form.getTextField("Emergency Contact"),
      relationship: form.getTextField("Relationship"),
      address_of_contact: form.getTextField("Address of Contact"),
      phone_2: form.getTextField("Phone_2"),
      tattoos_scars_marks: form.getTextField("TattoosScarsMarks"),
      drivers_license: form.getTextField("Drivers License"),
      dlstate: form.getTextField("DLSTATE"),

      arrest_agency: form.getTextField("ARREST INFORMATION"),
      agency_case_number: form.getTextField("Agency Case Number"),
      arrest_location: form.getTextField("Arrest Location"),
      vehicle_disposition_towing_company: form.getTextField(
        "Vehicle DispositionTowing Company"
      ),
      arresting_officer_id: form.getTextField("Arresting OfficerID"),
      transporting_officer_id: form.getTextField("Transporting OfficerID"),

      type_of_arrest: form.getRadioGroup("Type of Arrest"), // 1-4

      charges_row1: form.getTextField("ChargesRow1"),
      mf_row1: form.getTextField("MFRow1"),
      narrative1: form.getTextField("Narrative1"),
      court1: form.getTextField("Court1"),
      warrant1: form.getTextField("Warrant1"),
      bail1: form.getTextField("Bail1"),

      charges_row2: form.getTextField("ChargesRow2"),
      mf_row2: form.getTextField("MFRow2"),
      narrative2: form.getTextField("Narrative2"),
      court2: form.getTextField("Court2"),
      warrant2: form.getTextField("Warrant2"),
      bail2: form.getTextField("Bail2"),

      charges_row3: form.getTextField("ChargesRow3"),
      mf_row3: form.getTextField("MFRow3"),
      narrative3: form.getTextField("Narrative3"),
      court3: form.getTextField("Court3"),
      warrant3: form.getTextField("Warrant3"),
      bail3: form.getTextField("Bail3"),

      charges_row4: form.getTextField("ChargesRow4"),
      mf_row4: form.getTextField("MFRow4"),
      narrative4: form.getTextField("Narrative4"),
      court4: form.getTextField("Court4"),
      warrant4: form.getTextField("Warrant4"),
      bail4: form.getTextField("Bail4"),

      charges_row5: form.getTextField("ChargesRow5"),
      mf_row5: form.getTextField("MFRow5"),
      narrative5: form.getTextField("Narrative5"),
      court5: form.getTextField("Court5"),
      warrant5: form.getTextField("Warrant5"),
      bail5: form.getTextField("Bail5"),

      victim_request: form.getRadioGroup("Victim Request"), //1-2

      yes_no1: form.getRadioGroup("Yes/No1"), // 1-2
      yes_no2: form.getRadioGroup("Yes/No2"), // 1-2
      yes_no3: form.getRadioGroup("Yes/No3"), // 1-2
      yes_no4: form.getRadioGroup("Yes/No4"), // 1-2
      yes_no5: form.getRadioGroup("Yes/No5"), // 1-2
      yes_no6: form.getRadioGroup("Yes/No6"), // 1-2
      yes_no7: form.getRadioGroup("Yes/No7"), // 1-2
      yes_no8: form.getRadioGroup("Yes/No8"), // 1-2

      explain: form.getTextField("Explain"),

      on_sight: form.getTextField("OnSight"),
      agency_case_number_2: form.getTextField("Agency Case Number_2"),
      riverside_county_warrant_number: form.getTextField(
        "Riverside County Warrant Number"
      ),
      originative_police_agency: form.getTextField("Originative Police Agency"),
      reviewed_by: form.getTextField("Reviewed by"),
      send_bill_to: form.getTextField("Send bill to"),

      wrap_yes: form.getRadioGroup("WRAP Yes"), //1 same is for below
      wrap_no: form.getRadioGroup("WRAP No"), //2
      time_of_placement: form.getTextField("Time of Placement"),
      time_removed: form.getTextField("Time Removed"),
      transport_wrap_yes: form.getRadioGroup("Transport WRAP Yes"),
      transport_wrap_no: form.getRadioGroup("Transport WRAP No"),

      denied: form.getRadioGroup("Denied"),
      supervisor: form.getTextField("Supervisor"),
      reason: form.getTextField("Reason"),

      release: form.getRadioGroup("Release"),
      reason_denied: form.getTextField("Reason Denied"),

      notified: form.getRadioGroup("Notified"), // 1-2
      person_24_hr_phone: form.getTextField("Person  24 hr Phone"),
      arresting_agency_to_be_notified: form.getTextField(
        "Arresting Agency to be notified upon release of prisoner"
      ),
      who_was_contacted: form.getTextField("Who was contacted"),
      by_whom: form.getTextField("By whom"),

      group3: form.getRadioGroup("Group3"), // consolutation

      group4: form.getRadioGroup("Group4"),
      country: form.getTextField("Country"),
      name_id_person_making: form.getTextField("Name/ID of person making"),
      arresting_officer: form.getTextField("Arresting Officer"),
      booking_officer: form.getTextField("Booking Officer"),
    };

    // allFields.booking_date_time.setText("12/11/2024 14:30");
    // allFields.arrest_date.setText("12/11/2024");
    // allFields.arrest_time.setText("14:30");
    // allFields.booking_number.setText("BKG78910");
    // arrest_time is a time field, so we need to split the date and time
    const arrest_datetime = dayjs(data.formData.arrest_time);
    const bookingDatetime = dayjs(data.formData.booking_date);
    allFields.booking_date_time.setText(
      data.formData.booking_date !== ""
        ? bookingDatetime.format("MM/DD/YYYY HH:mm")
        : ""
    );
    if (data.formData.arrest_time !== "") {
      allFields.arrest_date.setText(arrest_datetime.format("MM/DD/YYYY"));
      allFields.arrest_time.setText(arrest_datetime.format("HH:mm"));
    }
    allFields.booking_number.setText(data.formData.booking_number);

    // allFields.defendant_information.setText("John Doe");
    // allFields.street.setText("123 Main St");
    // allFields.city.setText("Central City");
    // allFields.state.setText("CA");
    // allFields.zip.setText("12345");
    // allFields.phone.setText("123-456-789");
    // allFields.age.setText("35");
    // allFields.height.setText("6'2");
    // allFields.weight.setText("180 lbs");
    // allFields.hair.setText("Brown");
    // allFields.eyes.setText("Blue");
    // allFields.place_of_birth.setText("Central City");
    // allFields.ssn.setText("123-45-6789");
    // allFields.employer.setText("Acme Inc.");
    // allFields.occupation.setText("Engineer");
    // allFields.other_names_used.setText("None");
    // allFields.emergency_contact.setText("Jane Doe");
    // allFields.relationship.setText("Spouse");
    // allFields.address_of_contact.setText("123 Main St, Central City, CA 12345");
    // allFields.phone_2.setText("123-456-7890");
    // allFields.tattoos_scars_marks.setText("None");
    // allFields.sex.setText("Male");
    // allFields.race.setText("White");
    // allFields.dob.setText("01/01/1985");
    // allFields.drivers_license.setText("123456789");
    // allFields.group1.select("Choice2");
    // allFields.dlstate.setText("Chicago");
    allFields.defendant_information.setText(
      data.formData.last_name +
        ", " +
        data.formData.first_name +
        ", " +
        data.formData.middle_name
    );
    allFields.street.setText(data.formData.street);
    allFields.city.setText(data.formData.city);
    allFields.state.setText(data.formData.state);
    allFields.zip.setText(data.formData.zip);
    allFields.phone.setText(data.formData.home_telephone);
    allFields.age.setText(data.formData.age);
    allFields.height.setText(data.formData.height);
    allFields.weight.setText(data.formData.weight);
    allFields.hair.setText(data.formData.hair);
    allFields.eyes.setText(data.formData.eyes);
    allFields.place_of_birth.setText(data.formData.place_of_birth);
    allFields.ssn.setText(data.formData.ssn);
    allFields.employer.setText(data.formData.employer);
    allFields.occupation.setText(data.formData.occupation);
    allFields.other_names_used.setText(data.formData.other_names);
    allFields.emergency_contact.setText(data.formData.emergency_contact);
    allFields.relationship.setText(data.formData.emergency_relationship);
    allFields.address_of_contact.setText(data.formData.emergency_address);
    allFields.phone_2.setText(data.formData.emergency_phone);
    allFields.tattoos_scars_marks.setText(data.formData.tattoos_scars_marks);
    allFields.sex.setText(data.formData.sex);
    allFields.dob.setText(data.formData.dob);
    allFields.drivers_license.setText(data.formData.drivers_license);
    allFields.race.setText(data.formData.race);
    allFields.dlstate.setText(data.formData.dl_state);
    const r = data.formData.military_status === "true" ? "Choice1" : "Choice2";
    allFields.group1.select(r);

    // allFields.agency_case_number.setText("AC123456");
    // allFields.arrest_agency.setText("ci");
    // allFields.arrest_location.setText("Central City");
    // allFields.vehicle_disposition_towing_company.setText("Towing Co.");
    // allFields.arresting_officer_id.setText("12345");
    // allFields.transporting_officer_id.setText("54321");
    allFields.agency_case_number.setText(data.formData.agency_case_number);
    allFields.arrest_agency.setText(data.formData.arrest_agency);
    allFields.arrest_location.setText(data.formData.arrest_location);
    allFields.vehicle_disposition_towing_company.setText(
      data.formData.vehicle_disposition
    );
    allFields.arresting_officer_id.setText(data.formData.arresting_officer_id);
    allFields.transporting_officer_id.setText(
      data.formData.transporting_officer_id
    );

    // allFields.type_of_arrest.select("Choice2");
    let r2 = "";
    if (data.formData.type_of_arrest === "on-view") {
      r2 = "Choice1";
    } else if (data.formData.type_of_arrest === "warrent") {
      r2 = "Choice2";
    } else if (data.formData.type_of_arrest === "citizen") {
      r2 = "Choice3";
    } else if (data.formData.type_of_arrest === "other") {
      r2 = "Choice4";
    }
    allFields.type_of_arrest.select(r2);

    // allFields.charges_row1.setText("Theft");
    // allFields.mf_row1.setText("M");
    // allFields.narrative1.setText("Suspected theft in a local store.");
    // allFields.court1.setText("Central City Court");
    // allFields.warrant1.setText("123456");
    // allFields.bail1.setText("1000");

    data.charges.forEach((charge, i) => {
      if (i > 4) return;
      const row = i + 1;
      // @ts-ignore
      allFields[`charges_row${row}`].setText(charge.charges);
      // @ts-ignore
      allFields[`mf_row${row}`].setText(charge.mf);
      // @ts-ignore
      allFields[`narrative${row}`].setText(charge.narrative);
      // @ts-ignore
      allFields[`court${row}`].setText(charge.court);
      // @ts-ignore
      allFields[`warrant${row}`].setText(charge.warrantNumber);
      // @ts-ignore
      allFields[`bail${row}`].setText(charge.bail);
    });

    // allFields.victim_request.select("Choice1");
    allFields.victim_request.select(
      data.formData.victim_notification ? "Choice1" : "Choice2"
    );

    // allFields.yes_no1.select("Choice1");
    // allFields.yes_no2.select("Choice1");
    // allFields.yes_no3.select("Choice1");
    // allFields.yes_no4.select("Choice1");
    // allFields.yes_no5.select("Choice1");
    // allFields.yes_no6.select("Choice1");
    // allFields.yes_no7.select("Choice1");
    // allFields.yes_no8.select("Choice1");
    allFields.yes_no1.select(
      data.formData.suicidal_behavior ? "Choice1" : "Choice2"
    );
    allFields.yes_no2.select(
      data.formData.vehicle_accident ? "Choice1" : "Choice2"
    );
    allFields.yes_no3.select(
      data.formData.non_law_enforcement ? "Choice1" : "Choice2"
    );
    allFields.yes_no4.select(
      data.formData.lost_consciousness ? "Choice1" : "Choice2"
    );
    allFields.yes_no5.select(
      data.formData.special_housing_needs ? "Choice1" : "Choice2"
    );
    allFields.yes_no6.select(data.formData.ok_to_book ? "Choice1" : "Choice2");
    allFields.yes_no7.select(data.formData.did_tased ? "Choice1" : "Choice2");
    allFields.yes_no8.select(
      data.formData.was_arrested_wrap ? "Choice1" : "Choice2"
    );

    // allFields.explain.setText("None");
    allFields.explain.setText(data.formData.miscellaneous_explanation);

    // allFields.on_sight.setText("Yes");
    // allFields.agency_case_number_2.setText("AC123456");
    // allFields.riverside_county_warrant_number.setText("123456");
    // allFields.originative_police_agency.setText(
    //   "Central City Police Department"
    // );
    // allFields.reviewed_by.setText("Officer Smith");
    // allFields.send_bill_to.setText("Acme Inc.");
    allFields.on_sight.setText(data.formData.on_sight);
    allFields.agency_case_number_2.setText(data.formData.agency_case_number);
    allFields.riverside_county_warrant_number.setText(
      data.formData.riverside_warrant_number
    );
    allFields.originative_police_agency.setText(
      data.formData.originative_police_agency
    );
    allFields.reviewed_by.setText(data.formData.reviewed_by);
    allFields.send_bill_to.setText(data.formData.send_bill_to);

    // // allFields.wrap_yes.select("Choice1");
    // allFields.wrap_no.select("Choice2");
    // allFields.time_of_placement.setText("14:30");
    // allFields.time_removed.setText("16:30");
    // allFields.transport_wrap_yes.select("Choice1");
    // form.getRadioGroup("Transport WRAP Yes").select("Choice1");
    data.formData.wrap_restraint_force
      ? allFields.wrap_yes.select("Choice1")
      : allFields.wrap_no.select("Choice2");
    allFields.time_of_placement.setText(
      data.formData.wrap_restraint_time_placed
    );
    allFields.time_removed.setText(data.formData.wrap_restraint_time_removed);
    data.formData.wrap_restraint_jail_transport
      ? allFields.transport_wrap_yes.select("Choice1")
      : allFields.transport_wrap_no.select("Choice2");

    // allFields.denied.select("Choice1");
    // allFields.supervisor.setText("Officer Smith");
    // allFields.reason.setText("None");
    allFields.denied.select(
      data.formData.citation_release_denied ? "Choice1" : "Choice2"
    );
    allFields.supervisor.setText(data.formData.approving_supervisor);
    allFields.reason.setText(data.formData.citation_release_reason);

    // allFields.release.select("Choice1");
    // allFields.reason_denied.setText("None");
    allFields.release.select(
      data.formData.or_release_recommended ? "Choice1" : "Choice2"
    );
    allFields.reason_denied.setText(data.formData.or_release_reason);

    // allFields.notified.select("Choice1");
    // allFields.person_24_hr_phone.setText("123-456-7890");
    // allFields.arresting_agency_to_be_notified.setText(
    //   "Central City Police Department"
    // );
    // allFields.who_was_contacted.setText("Jane Doe");
    // allFields.by_whom.setText("Officer Smith");
    allFields.notified.select(
      data.formData.notify_arresting_agency ? "Choice1" : "Choice2"
    );
    allFields.person_24_hr_phone.setText(data.formData.notification_contact);
    // allFields.arresting_agency_to_be_notified.setText(data.formData.arresting_agency);
    const consolutation_date = dayjs(data.formData.consular_notification_time);
    if (data.formData.consular_notification_time !== "") {
      allFields.arresting_agency_to_be_notified.setText(
        consolutation_date.format("MM/DD/YYYY HH:mm")
      );
    }
    allFields.who_was_contacted.setText(
      data.formData.consular_notification_who_contacted
    );
    allFields.by_whom.setText(data.formData.consular_notification_by_whom);

    // allFields.group3.select("Choice1");
    // allFields.group4.select("Choice2");
    // allFields.country.setText("i");
    // allFields.name_id_person_making.setText("fjaklfjl");
    // allFields.arresting_officer.setText("JOeee");
    // allFields.booking_officer.setText("Officer Smith");
    if (data.formData.consular_notification_type !== "") {
      allFields.group3.select(
        data.formData.consular_notification_type === "mandatory"
          ? "Choice1"
          : "Choice2"
      );

      // TODO: Fix this
      // allFields.group4.select(
      //   data.formData.consular_notification_type === "mandatory"
      //     ? "Choice1"
      //     : "Choice2"
      // );
    }
    allFields.country.setText(data.formData.consular_notification_country);
    allFields.name_id_person_making.setText(
      data.formData.consular_notification_made_by
    );
    allFields.arresting_officer.setText(data.formData.arresting_officer);
    allFields.booking_officer.setText(data.formData.booking_officer);

    return await pdfDoc.save();
  } catch (err) {
    console.error("Error:", err);
  }
}
