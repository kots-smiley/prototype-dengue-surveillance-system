import { z } from 'zod';

export const createAllergySchema = z.object({
  patientId: z.string().min(1),
  substance: z.string().min(1),
  reaction: z.string().optional(),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']).optional(),
});

export const createProblemSchema = z.object({
  patientId: z.string().min(1),
  name: z.string().min(1),
  status: z.enum(['ACTIVE', 'RESOLVED', 'INACTIVE']).optional().default('ACTIVE'),
  onsetDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateProblemSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'INACTIVE']).optional(),
  onsetDate: z.coerce.date().optional(),
  resolvedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const listClinicalQuerySchema = z.object({
  patientId: z.string().optional(),
  category: z.enum(['PMH', 'SURGICAL', 'FAMILY', 'SOCIAL']).optional(),
});

export const createHistorySchema = z.object({
  patientId: z.string().min(1),
  category: z.enum(['PMH', 'SURGICAL', 'FAMILY', 'SOCIAL']),
  description: z.string().min(1),
  notes: z.string().optional(),
});

export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type ListClinicalQuery = z.infer<typeof listClinicalQuerySchema>;
export type CreateHistoryInput = z.infer<typeof createHistorySchema>;
