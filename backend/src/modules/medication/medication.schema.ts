import { z } from 'zod';

export const createMedicationSchema = z.object({
  patientId: z.string().min(1),
  drug: z.string().min(1),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  route: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMedicationSchema = z.object({
  drug: z.string().min(1).optional(),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  route: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISCONTINUED']).optional(),
  endDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const listMedicationQuerySchema = z.object({
  patientId: z.string().optional(),
  status: z.enum(['ACTIVE', 'DISCONTINUED']).optional(),
});

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;
export type ListMedicationQuery = z.infer<typeof listMedicationQuerySchema>;
