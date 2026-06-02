/**
 * Application-wide constants and enumerations.
 * Single source of truth for domain string unions used across modules.
 */

export const UserRole = {
  ADMIN: 'ADMIN',
  BHW: 'BHW',
  HOSPITAL_ENCODER: 'HOSPITAL_ENCODER',
  RESIDENT: 'RESIDENT',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

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

/** Risk-report factor keys grouped by transmission category. */
export const RISK_FACTORS_BY_CATEGORY: Record<string, string[]> = {
  VECTOR_BORNE: ['stagnantWater', 'poorWasteDisposal', 'cloggedDrainage', 'housingCongestion'],
  WATER_BORNE: ['unsafeWaterSource', 'poorSanitation', 'openDefecation', 'foodContamination'],
  AIRBORNE: ['overcrowding', 'poorVentilation', 'activeRespiratoryCase'],
};
