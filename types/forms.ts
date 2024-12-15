export interface RiversideCountySheriffFormData {
  // Basic Information
  "jail-location": string;
  arrestee: string;
  arrestee_info: string;
  dob: string;
  "agency-case": string;
  booking: string;
  "facility-fax": string;

  // Counts and Violations (1-4)
  charges: Array<{
    count: string;
    violation: string;
  }>;
  // "count-1": string;
  // "count-2": string;
  // "count-3": string;
  // "count-4": string;
  // "violation-1": string;
  // "violation-2": string;
  // "violation-3": string;
  // "violation-4": string;

  // Arrest Details
  "arresting-agency": string;
  "arrest-date": string;
  "arrest-time": string;
  recommended: "yes" | "no";
  reason: string;

  // Warrant Information
  "probable-cause-radio": "arrest-warrant" | "bench-warrant" | "parole-hold";

  // Victim Information
  "victim-age": string;
  "victim-relationship": string;
  "victim-injuries": string;

  // Contraband Information
  contraband: string;
  quantity: string;

  // Additional Information
  // additional_page_checkbox: boolean;

  // Probable Cause
  "probable-cause": string;
  // "additional-info-text"?: string;

  // Declaration Information
  "declarant-signature": string;
  "arr-officer-phone": string;
  "agency-fax": string;
  "print-name": string;

  // Determination
  probable_cause_determination: "is" | "is-not" | "";
  probable_cause_belief: "exists" | "exists-augmented" | "not-shown" | "";

  // Magistrate Information
  "magistrate-date": string;
  "magistrate-time": string;
  "magistrate-signature": string;
  "by-direction": string;
}

export interface BookingFormState {
  // Personal Information
  arrest_time: string;
  booking_date: string;
  booking_number: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  home_telephone: string;
  military_status: "true" | "false";
  sex: "male" | "female" | "other";
  race: string;
  dob: string;
  age: string;
  height: string;
  weight: string;
  hair: string;
  eyes: string;
  place_of_birth: string;

  // Identification
  drivers_license: string;
  dl_state: string;
  ssn: string;

  // Employment
  employer: string;
  occupation: string;

  // Additional Information
  other_names: string;
  tattoos_scars_marks: string;

  // Emergency Contact
  emergency_contact: string;
  emergency_relationship: string;
  emergency_address: string;
  emergency_phone: string;

  // Arrest Details
  arrest_agency: string;
  agency_case_number: string;
  arrest_location: string;
  vehicle_disposition: string;
  arresting_officer_id: string;
  transporting_officer_id: string;
  type_of_arrest: "on-view" | "warrent" | "citizen" | "other";

  // Victim Notification
  victim_notification: boolean;

  // miscellaneous
  suicidal_behavior: boolean;
  vehicle_accident: boolean;
  non_law_enforcement: boolean;
  lost_consciousness: boolean;
  special_housing_needs: boolean;
  ok_to_book: boolean;
  did_tased: boolean;
  was_arrested_wrap: boolean;
  miscellaneous_explanation: string;

  // Wrap Restraint
  wrap_restraint: boolean;
  wrap_restraint_force: boolean;
  wrap_restraint_time_placed: string;
  wrap_restraint_time_removed: string;
  wrap_restraint_jail_transport: boolean;

  // Release Information
  citation_release_denied: boolean;
  approving_supervisor: string;
  citation_release_reason: string;
  or_release_recommended: boolean;
  or_release_reason: string;
  notify_arresting_agency: boolean;
  notification_contact: string;

  consular_notification_time: string;
  consular_notification_who_contacted: string;
  consular_notification_by_whom: string;

  // Consular Notification
  consular_notification_type: "mandatory" | "requested" | "";
  consular_notification_country: string;
  consular_notification_made_by: string;

  // Officers
  arresting_officer: string;
  booking_officer: string;

  // Billing Information
  on_sight: string;
  agency_case_number_billing: string;
  riverside_warrant_number: string;
  originative_police_agency: string;
  reviewed_by: string;
  send_bill_to: string;
}

export interface FormEntry {
  id: number;
  charges: string;
  mf: string;
  narrative: string;
  court: string;
  warrantNumber: string;
  bail: string;
}
