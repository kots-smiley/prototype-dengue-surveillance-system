export const RISK_CATEGORY_OPTIONS = [
  { value: 'VECTOR_BORNE', label: 'Vector-borne (e.g. dengue, malaria)' },
  { value: 'WATER_BORNE', label: 'Water-borne (e.g. typhoid, leptospirosis)' },
  { value: 'AIRBORNE', label: 'Airborne (e.g. flu, TB, COVID-19)' },
] as const;

export const RISK_FACTORS_BY_CATEGORY: Record<string, { key: string; label: string }[]> = {
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

export type RiskFactorKey =
  | 'stagnantWater'
  | 'poorWasteDisposal'
  | 'cloggedDrainage'
  | 'housingCongestion'
  | 'unsafeWaterSource'
  | 'poorSanitation'
  | 'openDefecation'
  | 'foodContamination'
  | 'overcrowding'
  | 'poorVentilation'
  | 'activeRespiratoryCase';

export type FactorState = Record<RiskFactorKey, boolean>;

export const EMPTY_FACTORS: FactorState = {
  stagnantWater: false,
  poorWasteDisposal: false,
  cloggedDrainage: false,
  housingCongestion: false,
  unsafeWaterSource: false,
  poorSanitation: false,
  openDefecation: false,
  foodContamination: false,
  overcrowding: false,
  poorVentilation: false,
  activeRespiratoryCase: false,
};
