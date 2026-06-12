/**
 * Application-wide constants and enumerations.
 * Single source of truth for domain string unions used across modules.
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  HEALTH_OFFICER: 'HEALTH_OFFICER', // Municipal Health Officer (MHO) — municipality-wide access
  FACILITY_ADMIN: 'FACILITY_ADMIN', // administrator of a single facility
  BHW: 'BHW',
  HOSPITAL_ENCODER: 'HOSPITAL_ENCODER',
  RESIDENT: 'RESIDENT',
  PHYSICIAN: 'PHYSICIAN',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Roles allowed to access patient-identifiable EMR/EHR data. */
export const CLINICAL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.HEALTH_OFFICER,
  UserRole.FACILITY_ADMIN,
  UserRole.PHYSICIAN,
  UserRole.NURSE,
  UserRole.MIDWIFE,
];

/** Roles with municipality-wide reach (not scoped to a single facility). */
export const MUNICIPAL_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.HEALTH_OFFICER];

export const DiseaseCategory = {
  VECTOR_BORNE: 'VECTOR_BORNE',
  WATER_BORNE: 'WATER_BORNE',
  AIRBORNE: 'AIRBORNE',
  DIRECT_CONTACT: 'DIRECT_CONTACT',
  OTHER: 'OTHER',
} as const;
export type DiseaseCategory = (typeof DiseaseCategory)[keyof typeof DiseaseCategory];

export const CaseStatus = {
  SUSPECTED: 'SUSPECTED',
  PROBABLE: 'PROBABLE',
  CONFIRMED: 'CONFIRMED',
} as const;
export type CaseStatus = (typeof CaseStatus)[keyof typeof CaseStatus];

export const CaseOutcome = {
  ONGOING: 'ONGOING',
  RECOVERED: 'RECOVERED',
  DIED: 'DIED',
} as const;
export type CaseOutcome = (typeof CaseOutcome)[keyof typeof CaseOutcome];

export const CaseSource = {
  PUBLIC_HOSPITAL: 'PUBLIC_HOSPITAL',
  PRIVATE_HOSPITAL: 'PRIVATE_HOSPITAL',
  RHU: 'RHU',
  BHW: 'BHW',
} as const;
export type CaseSource = (typeof CaseSource)[keyof typeof CaseSource];

export const Sex = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;
export type Sex = (typeof Sex)[keyof typeof Sex];

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export const AlertStatus = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED',
} as const;
export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus];

export const FeedbackThreadStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type FeedbackThreadStatus =
  (typeof FeedbackThreadStatus)[keyof typeof FeedbackThreadStatus];

/** Risk-report factor keys grouped by transmission category. */
export const RISK_FACTORS_BY_CATEGORY: Record<string, string[]> = {
  VECTOR_BORNE: ['stagnantWater', 'poorWasteDisposal', 'cloggedDrainage', 'housingCongestion'],
  WATER_BORNE: ['unsafeWaterSource', 'poorSanitation', 'openDefecation', 'foodContamination'],
  AIRBORNE: ['overcrowding', 'poorVentilation', 'activeRespiratoryCase'],
};

// ---------------------------------------------------------------------------
// EMR enumerations
// ---------------------------------------------------------------------------
export const EncounterType = {
  CONSULT: 'CONSULT',
  PRENATAL: 'PRENATAL',
  IMMUNIZATION: 'IMMUNIZATION',
  TB: 'TB',
  NCD: 'NCD',
  FOLLOWUP: 'FOLLOWUP',
} as const;
export type EncounterType = (typeof EncounterType)[keyof typeof EncounterType];

export const DiagnosisCertainty = {
  SUSPECTED: 'SUSPECTED',
  PROBABLE: 'PROBABLE',
  CONFIRMED: 'CONFIRMED',
} as const;
export type DiagnosisCertainty = (typeof DiagnosisCertainty)[keyof typeof DiagnosisCertainty];

export const CivilStatus = {
  SINGLE: 'SINGLE',
  MARRIED: 'MARRIED',
  WIDOWED: 'WIDOWED',
  SEPARATED: 'SEPARATED',
  OTHER: 'OTHER',
} as const;
export type CivilStatus = (typeof CivilStatus)[keyof typeof CivilStatus];

export const ProblemStatus = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
  INACTIVE: 'INACTIVE',
} as const;
export type ProblemStatus = (typeof ProblemStatus)[keyof typeof ProblemStatus];

export const AllergySeverity = {
  MILD: 'MILD',
  MODERATE: 'MODERATE',
  SEVERE: 'SEVERE',
} as const;
export type AllergySeverity = (typeof AllergySeverity)[keyof typeof AllergySeverity];

/**
 * Small ICD-10 reference subset mapped to the surveillance Disease registry
 * codes. Used to pre-fill diagnoses and link them to notifiable diseases.
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

// ---------------------------------------------------------------------------
// EHR (municipality-wide) enumerations
// ---------------------------------------------------------------------------
export const FacilityType = {
  RHU_MAIN: 'RHU_MAIN',
  BARANGAY_HEALTH_STATION: 'BARANGAY_HEALTH_STATION',
  MUNICIPAL_HOSPITAL: 'MUNICIPAL_HOSPITAL',
  DISTRICT_HOSPITAL: 'DISTRICT_HOSPITAL',
  PRIVATE_CLINIC: 'PRIVATE_CLINIC',
  LABORATORY: 'LABORATORY',
  PHARMACY: 'PHARMACY',
} as const;
export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];

export const ReferralStatus = {
  REQUESTED: 'REQUESTED',
  ACCEPTED: 'ACCEPTED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;
export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

export const ReferralPriority = {
  ROUTINE: 'ROUTINE',
  URGENT: 'URGENT',
  EMERGENCY: 'EMERGENCY',
} as const;
export type ReferralPriority = (typeof ReferralPriority)[keyof typeof ReferralPriority];

export const ConsentPurpose = {
  TREATMENT: 'TREATMENT',
  EMERGENCY: 'EMERGENCY',
  PUBLIC_HEALTH: 'PUBLIC_HEALTH',
} as const;
export type ConsentPurpose = (typeof ConsentPurpose)[keyof typeof ConsentPurpose];

export const ConsentScope = {
  SUMMARY: 'SUMMARY',
  FULL: 'FULL',
} as const;
export type ConsentScope = (typeof ConsentScope)[keyof typeof ConsentScope];

export const ConsentStatus = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED',
} as const;
export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export const IdentifierSystem = {
  PHILHEALTH: 'PHILHEALTH',
  PHILSYS: 'PHILSYS',
  LOCAL: 'LOCAL',
  OTHER: 'OTHER',
} as const;
export type IdentifierSystem = (typeof IdentifierSystem)[keyof typeof IdentifierSystem];

/** Purpose-of-use values recorded on access events (ISO 27799). */
export const PurposeOfUse = {
  TREATMENT: 'TREATMENT',
  EMERGENCY: 'EMERGENCY',
  PUBLIC_HEALTH: 'PUBLIC_HEALTH',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
} as const;
export type PurposeOfUse = (typeof PurposeOfUse)[keyof typeof PurposeOfUse];

export const DocumentType = {
  LAB_REPORT: 'LAB_REPORT',
  REFERRAL_LETTER: 'REFERRAL_LETTER',
  DISCHARGE_SUMMARY: 'DISCHARGE_SUMMARY',
  IMAGING: 'IMAGING',
  OTHER: 'OTHER',
} as const;
export type DocumentType = (typeof DocumentType)[keyof typeof DocumentType];

export const TerminologySystem = {
  ICD10: 'ICD10',
  LOINC: 'LOINC',
  SNOMED: 'SNOMED',
  ATC: 'ATC',
} as const;
export type TerminologySystem = (typeof TerminologySystem)[keyof typeof TerminologySystem];

/**
 * Standard LOINC codes for the vital signs we capture. Used by the FHIR
 * mapper to emit coded Observation resources.
 */
export const VITAL_SIGN_LOINC: Record<string, { code: string; display: string; unit: string }> = {
  systolic: { code: '8480-6', display: 'Systolic blood pressure', unit: 'mm[Hg]' },
  diastolic: { code: '8462-4', display: 'Diastolic blood pressure', unit: 'mm[Hg]' },
  temperature: { code: '8310-5', display: 'Body temperature', unit: 'Cel' },
  heartRate: { code: '8867-4', display: 'Heart rate', unit: '/min' },
  respiratoryRate: { code: '9279-1', display: 'Respiratory rate', unit: '/min' },
  weight: { code: '29463-7', display: 'Body weight', unit: 'kg' },
  height: { code: '8302-2', display: 'Body height', unit: 'cm' },
  bmi: { code: '39156-5', display: 'Body mass index', unit: 'kg/m2' },
  oxygenSat: { code: '59408-5', display: 'Oxygen saturation', unit: '%' },
};

/** Seed subset of LOINC lab observation codes. */
export const LOINC_REFERENCE: { code: string; display: string }[] = [
  { code: '58410-2', display: 'Complete blood count (CBC) panel' },
  { code: '789-8', display: 'Erythrocytes (RBC) count' },
  { code: '718-7', display: 'Hemoglobin' },
  { code: '777-3', display: 'Platelet count' },
  { code: '6690-2', display: 'Leukocytes (WBC) count' },
  { code: '2345-7', display: 'Glucose (blood)' },
  { code: '2160-0', display: 'Creatinine (serum)' },
  { code: '14682-9', display: 'Urinalysis' },
  { code: '5196-1', display: 'Hepatitis B surface antigen' },
  { code: '5404-9', display: 'Dengue NS1 antigen' },
];

/** Seed subset of SNOMED CT clinical findings (paired with common diagnoses). */
export const SNOMED_REFERENCE: { code: string; display: string }[] = [
  { code: '38362002', display: 'Dengue fever' },
  { code: '61462000', display: 'Malaria' },
  { code: '4834000', display: 'Typhoid fever' },
  { code: '38907003', display: 'Varicella' },
  { code: '14189004', display: 'Measles' },
  { code: '56717001', display: 'Tuberculosis' },
  { code: '840539006', display: 'COVID-19' },
  { code: '38341003', display: 'Hypertensive disorder' },
  { code: '44054006', display: 'Type 2 diabetes mellitus' },
];
