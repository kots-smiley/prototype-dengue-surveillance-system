import { z } from 'zod';

export const createLabSchema = z.object({
  patientId: z.string().min(1),
  encounterId: z.string().optional(),
  testName: z.string().min(1),
  value: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  resultDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateLabSchema = createLabSchema.partial().omit({ patientId: true });

export const listLabQuerySchema = z.object({
  patientId: z.string().optional(),
  encounterId: z.string().optional(),
});

export type CreateLabInput = z.infer<typeof createLabSchema>;
export type UpdateLabInput = z.infer<typeof updateLabSchema>;
export type ListLabQuery = z.infer<typeof listLabQuerySchema>;
