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
  "count-1": string;
  "count-2": string;
  "count-3": string;
  "count-4": string;
  "violation-1": string;
  "violation-2": string;
  "violation-3": string;
  "violation-4": string;

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
  additional_page_checkbox: boolean;

  // Probable Cause
  "probable-cause": string;
  "additional-info-text"?: string;

  // Declaration Information
  "declarant-signature": string;
  "arr-officer-phone": string;
  "agency-fax": string;
  "print-name": string;

  // Determination
  probable_cause_determination: "is" | "is-not";
  probable_cause_belief: "exists" | "exists-augmented" | "not-shown";

  // Magistrate Information
  "magistrate-date": string;
  "magistrate-time": string;
  "magistrate-signature": string;
  "by-direction": string;
}
