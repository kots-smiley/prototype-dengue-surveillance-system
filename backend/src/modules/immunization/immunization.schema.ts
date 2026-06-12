import { z } from 'zod';

export const createImmunizationSchema = z.object({
  patientId: z.string().min(1),
  vaccine: z.string().min(1),
  doseNumber: z.number().int().min(0).optional(),
  dateGiven: z.coerce.date(),
  nextDueDate: z.coerce.date().optional(),
  administeredBy: z.string().optional(),
  notes: z.string().optional(),
});

export const updateImmunizationSchema = createImmunizationSchema.partial().omit({ patientId: true });

export const listImmunizationQuerySchema = z.object({
  patientId: z.string().optional(),
});

export type CreateImmunizationInput = z.infer<typeof createImmunizationSchema>;
export type UpdateImmunizationInput = z.infer<typeof updateImmunizationSchema>;
export type ListImmunizationQuery = z.infer<typeof listImmunizationQuerySchema>;
