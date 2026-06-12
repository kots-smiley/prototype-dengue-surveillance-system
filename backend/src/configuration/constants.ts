/**
 * Application-wide constants and enumerations.
 * Single source of truth for domain string unions used across modules.
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  BHW: 'BHW',
  HOSPITAL_ENCODER: 'HOSPITAL_ENCODER',
  RESIDENT: 'RESIDENT',
  PHYSICIAN: 'PHYSICIAN',
  NURSE: 'NURSE',
  MIDWIFE: 'MIDWIFE',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Roles allowed to access patient-identifiable EMR data. */
export const CLINICAL_ROLES: UserRole[] = [
  UserRole.ADMIN,
  UserRole.PHYSICIAN,
  UserRole.NURSE,
  UserRole.MIDWIFE,
];

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
