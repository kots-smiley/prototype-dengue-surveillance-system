import { z } from 'zod';

const certaintyEnum = z.enum(['SUSPECTED', 'PROBABLE', 'CONFIRMED']);
const encounterTypeEnum = z.enum(['CONSULT', 'PRENATAL', 'IMMUNIZATION', 'TB', 'NCD', 'FOLLOWUP']);

/** Treat empty strings as undefined for optional query/body fields. */
const optionalString = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().optional()
);

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
  diseaseId: optionalString,
  icd10Code: optionalString,
  snomedCode: optionalString,
  description: z.string().min(1),
  certainty: certaintyEnum.optional().default('CONFIRMED'),
  isPrimary: z.boolean().optional().default(false),
});

const prescriptionItemSchema = z.object({
  drug: z.string().min(1),
  dose: optionalString,
  frequency: optionalString,
  duration: optionalString,
  instructions: optionalString,
});

const prescriptionSchema = z.object({
  items: z.array(prescriptionItemSchema).min(1),
  notes: optionalString,
});

const encounterBodySchema = z.object({
  barangayId: optionalString,
  facilityId: optionalString,
  type: encounterTypeEnum.optional().default('CONSULT'),
  encounterDate: z.coerce.date().optional(),
  chiefComplaint: optionalString,
  subjective: optionalString,
  objective: optionalString,
  assessment: optionalString,
  plan: optionalString,
  vitalSign: vitalSignSchema.optional(),
  diagnoses: z.array(diagnosisSchema).optional().default([]),
  prescriptions: z
    .preprocess(
      (val) =>
        Array.isArray(val)
          ? val.filter(
              (entry) =>
                entry &&
                typeof entry === 'object' &&
                Array.isArray((entry as { items?: unknown[] }).items) &&
                (entry as { items: unknown[] }).items.length > 0
            )
          : val,
      z.array(prescriptionSchema).optional().default([])
    ),
});

export const createEncounterSchema = encounterBodySchema.extend({
  patientId: z.string().min(1),
});

export const updateEncounterSchema = encounterBodySchema;

export const listEncounterQuerySchema = z.object({
  patientId: optionalString,
  type: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    encounterTypeEnum.optional()
  ),
  page: optionalString,
  limit: optionalString,
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;
export type UpdateEncounterInput = z.infer<typeof updateEncounterSchema>;
export type ListEncounterQuery = z.infer<typeof listEncounterQuerySchema>;
