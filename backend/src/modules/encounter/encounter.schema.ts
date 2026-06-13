import { z } from 'zod';

const certaintyEnum = z.enum(['SUSPECTED', 'PROBABLE', 'CONFIRMED']);
const encounterTypeEnum = z.enum(['CONSULT', 'PRENATAL', 'IMMUNIZATION', 'TB', 'NCD', 'FOLLOWUP']);

const vitalSignSchema = z.object({
  systolic: z.number().int().min(0).max(300).optional(),
  diastolic: z.number().int().min(0).max(200).optional(),
  temperature: z.number().min(25).max(45).optional(),
  heartRate: z.number().int().min(0).max(300).optional(),
  respiratoryRate: z.number().int().min(0).max(120).optional(),
  weight: z.number().min(0).max(500).optional(),
  height: z.number().min(0).max(300).optional(),
  oxygenSat: z.number().int().min(0).max(100).optional(),
});

const diagnosisSchema = z.object({
  diseaseId: z.string().optional(),
  icd10Code: z.string().optional(),
  snomedCode: z.string().optional(),
  description: z.string().min(1),
  certainty: certaintyEnum.optional().default('CONFIRMED'),
  isPrimary: z.boolean().optional().default(false),
});

const prescriptionItemSchema = z.object({
  drug: z.string().min(1),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1),
  notes: z.string().optional(),
});

export const createEncounterSchema = z.object({
  patientId: z.string().min(1),
  barangayId: z.string().optional(),
  facilityId: z.string().optional(),
  type: encounterTypeEnum.optional().default('CONSULT'),
  encounterDate: z.coerce.date().optional(),
  chiefComplaint: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  vitalSign: vitalSignSchema.optional(),
  diagnoses: z.array(diagnosisSchema).optional().default([]),
  prescriptions: z.array(prescriptionSchema).optional().default([]),
});

export const updateEncounterSchema = createEncounterSchema.omit({ patientId: true });

export const listEncounterQuerySchema = z.object({
  patientId: z.string().optional(),
  type: encounterTypeEnum.optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
export type ListEncounterQuery = z.infer<typeof listEncounterQuerySchema>;
