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
  { value: 'BHW', label: 'Barangay Health Worker' },
  { value: 'HOSPITAL_ENCODER', label: 'Hospital Encoder' },
  { value: 'RESIDENT', label: 'Resident' },
] as const;

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
