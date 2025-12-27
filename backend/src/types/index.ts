export const UserRole = {
  ADMIN: 'ADMIN',
  BHW: 'BHW',
  HOSPITAL_ENCODER: 'HOSPITAL_ENCODER',
  RESIDENT: 'RESIDENT'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const CaseStatus = {
  SUSPECTED: 'SUSPECTED',
  CONFIRMED: 'CONFIRMED'
} as const;

export type CaseStatus = typeof CaseStatus[keyof typeof CaseStatus];

export const CaseSource = {
  PUBLIC_HOSPITAL: 'PUBLIC_HOSPITAL',
  PRIVATE_HOSPITAL: 'PRIVATE_HOSPITAL',
  RHU: 'RHU',
  BHW: 'BHW'
} as const;

export type CaseSource = typeof CaseSource[keyof typeof CaseSource];

export const RiskLevel = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type RiskLevel = typeof RiskLevel[keyof typeof RiskLevel];

export const AlertStatus = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED',
  DISMISSED: 'DISMISSED'
} as const;

export type AlertStatus = typeof AlertStatus[keyof typeof AlertStatus];
