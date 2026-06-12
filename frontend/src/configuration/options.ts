/** Static dropdown option sets shared across forms and filters. */

export const DISEASE_CATEGORY_OPTIONS = [
  { value: 'VECTOR_BORNE', label: 'Vector-borne' },
  { value: 'WATER_BORNE', label: 'Water-borne' },
  { value: 'AIRBORNE', label: 'Airborne' },
  { value: 'DIRECT_CONTACT', label: 'Direct contact' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const CASE_STATUS_OPTIONS = [
  { value: 'SUSPECTED', label: 'Suspected' },
  { value: 'PROBABLE', label: 'Probable' },
  { value: 'CONFIRMED', label: 'Confirmed' },
] as const;

export const CASE_OUTCOME_OPTIONS = [
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'RECOVERED', label: 'Recovered' },
  { value: 'DIED', label: 'Died' },
] as const;

export const CASE_SOURCE_OPTIONS = [
  { value: 'PUBLIC_HOSPITAL', label: 'Public Hospital' },
  { value: 'PRIVATE_HOSPITAL', label: 'Private Hospital' },
  { value: 'RHU', label: 'RHU' },
  { value: 'BHW', label: 'BHW' },
] as const;

export const SEX_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
] as const;

export const AGE_GROUP_OPTIONS = [
  '0-5',
  '6-12',
  '13-18',
  '19-30',
  '31-50',
  '50+',
] as const;

export const USER_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Administrator (RHU)' },
  { value: 'PHYSICIAN', label: 'Physician' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'MIDWIFE', label: 'Midwife' },
  { value: 'BHW', label: 'Barangay Health Worker' },
  { value: 'HOSPITAL_ENCODER', label: 'Hospital Encoder' },
  { value: 'RESIDENT', label: 'Resident' },
] as const;

export const ENCOUNTER_TYPE_OPTIONS = [
  { value: 'CONSULT', label: 'Consultation' },
  { value: 'PRENATAL', label: 'Prenatal' },
  { value: 'IMMUNIZATION', label: 'Immunization' },
  { value: 'TB', label: 'TB DOTS' },
  { value: 'NCD', label: 'NCD (Hypertension/Diabetes)' },
  { value: 'FOLLOWUP', label: 'Follow-up' },
] as const;

export const DIAGNOSIS_CERTAINTY_OPTIONS = [
  { value: 'SUSPECTED', label: 'Suspected' },
  { value: 'PROBABLE', label: 'Probable' },
  { value: 'CONFIRMED', label: 'Confirmed' },
] as const;

export const CIVIL_STATUS_OPTIONS = [
  { value: 'SINGLE', label: 'Single' },
  { value: 'MARRIED', label: 'Married' },
  { value: 'WIDOWED', label: 'Widowed' },
  { value: 'SEPARATED', label: 'Separated' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const PROBLEM_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export const ALLERGY_SEVERITY_OPTIONS = [
  { value: 'MILD', label: 'Mild' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'SEVERE', label: 'Severe' },
] as const;

export const BLOOD_TYPE_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-',
] as const;

export const FACILITY_TYPE_OPTIONS = [
  { value: 'RHU_MAIN', label: 'RHU (Main)' },
  { value: 'BARANGAY_HEALTH_STATION', label: 'Barangay Health Station' },
  { value: 'MUNICIPAL_HOSPITAL', label: 'Municipal Hospital' },
  { value: 'DISTRICT_HOSPITAL', label: 'District Hospital' },
  { value: 'PRIVATE_CLINIC', label: 'Private Clinic' },
  { value: 'LABORATORY', label: 'Laboratory' },
  { value: 'PHARMACY', label: 'Pharmacy' },
] as const;

export const REFERRAL_PRIORITY_OPTIONS = [
  { value: 'ROUTINE', label: 'Routine' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'EMERGENCY', label: 'Emergency' },
] as const;

export const CONSENT_PURPOSE_OPTIONS = [
  { value: 'TREATMENT', label: 'Treatment' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'PUBLIC_HEALTH', label: 'Public Health' },
] as const;

export const CONSENT_SCOPE_OPTIONS = [
  { value: 'SUMMARY', label: 'Summary only' },
  { value: 'FULL', label: 'Full record' },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'LAB_REPORT', label: 'Lab report' },
  { value: 'REFERRAL_LETTER', label: 'Referral letter' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge summary' },
  { value: 'IMAGING', label: 'Imaging' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const IDENTIFIER_SYSTEM_OPTIONS = [
  { value: 'PHILHEALTH', label: 'PhilHealth' },
  { value: 'PHILSYS', label: 'PhilSys (National ID)' },
  { value: 'LOCAL', label: 'Local ID' },
  { value: 'OTHER', label: 'Other' },
] as const;

/**
 * Small ICD-10 reference subset. `diseaseCode` links a diagnosis to the
 * surveillance Disease registry so notifiable diagnoses auto-generate cases.
 */
export const ICD10_REFERENCE: { code: string; description: string; diseaseCode?: string }[] = [
  { code: 'A90', description: 'Dengue fever', diseaseCode: 'DENG' },
  { code: 'A91', description: 'Dengue hemorrhagic fever', diseaseCode: 'DENG' },
  { code: 'B54', description: 'Unspecified malaria', diseaseCode: 'MAL' },
  { code: 'A01.0', description: 'Typhoid fever', diseaseCode: 'TYPH' },
  { code: 'A09', description: 'Acute bloody diarrhea / gastroenteritis', diseaseCode: 'ABD' },
  { code: 'A27.9', description: 'Leptospirosis, unspecified', diseaseCode: 'LEPTO' },
  { code: 'J11.1', description: 'Influenza-like illness', diseaseCode: 'ILI' },
  { code: 'B05.9', description: 'Measles without complication', diseaseCode: 'MEAS' },
  { code: 'A15.0', description: 'Tuberculosis of lung', diseaseCode: 'TB' },
  { code: 'U07.1', description: 'COVID-19, virus identified', diseaseCode: 'COVID' },
  { code: 'I10', description: 'Essential (primary) hypertension' },
  { code: 'E11', description: 'Type 2 diabetes mellitus' },
  { code: 'J06.9', description: 'Acute upper respiratory infection' },
  { code: 'Z34', description: 'Supervision of normal pregnancy' },
  { code: 'Z00.0', description: 'General medical examination' },
];

export const RISK_LEVEL_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

export const ALERT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'DISMISSED', label: 'Dismissed' },
] as const;

/** Risk-report factor definitions grouped by transmission category. */
export const RISK_FACTORS_BY_CATEGORY: Record<
  string,
  { key: string; label: string }[]
> = {
  VECTOR_BORNE: [
    { key: 'stagnantWater', label: 'Stagnant water' },
    { key: 'poorWasteDisposal', label: 'Poor waste disposal' },
    { key: 'cloggedDrainage', label: 'Clogged drainage' },
    { key: 'housingCongestion', label: 'Housing congestion' },
  ],
  WATER_BORNE: [
    { key: 'unsafeWaterSource', label: 'Unsafe water source' },
    { key: 'poorSanitation', label: 'Poor sanitation' },
    { key: 'openDefecation', label: 'Open defecation' },
    { key: 'foodContamination', label: 'Food contamination' },
  ],
  AIRBORNE: [
    { key: 'overcrowding', label: 'Overcrowding' },
    { key: 'poorVentilation', label: 'Poor ventilation' },
    { key: 'activeRespiratoryCase', label: 'Active respiratory case nearby' },
  ],
};

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
