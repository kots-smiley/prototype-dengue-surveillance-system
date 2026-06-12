import { z } from 'zod';

export const createMaternalSchema = z.object({
  patientId: z.string().min(1),
  lmp: z.coerce.date().optional(),
  edd: z.coerce.date().optional(),
  gravida: z.number().int().min(0).optional(),
  para: z.number().int().min(0).optional(),
  prenatalVisit: z.number().int().min(0).optional(),
  visitDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateMaternalSchema = createMaternalSchema.partial().omit({ patientId: true });

export const listMaternalQuerySchema = z.object({
  patientId: z.string().optional(),
});

export type CreateMaternalInput = z.infer<typeof createMaternalSchema>;
export type UpdateMaternalInput = z.infer<typeof updateMaternalSchema>;
export type ListMaternalQuery = z.infer<typeof listMaternalQuerySchema>;
