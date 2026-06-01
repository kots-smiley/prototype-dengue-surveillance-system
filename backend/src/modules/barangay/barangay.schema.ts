import { z } from 'zod';

export const createBarangaySchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  municipality: z.string().min(1).default('Lopez'),
  province: z.string().min(1).default('Quezon'),
  population: z.number().int().positive().optional(),
});

export const updateBarangaySchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  municipality: z.string().min(1).optional(),
  province: z.string().min(1).optional(),
  population: z.number().int().positive().optional(),
});

export const listBarangayQuerySchema = z.object({
  municipality: z.string().optional(),
  province: z.string().optional(),
  search: z.string().optional(),
});

export type CreateBarangayInput = z.infer<typeof createBarangaySchema>;
export type UpdateBarangayInput = z.infer<typeof updateBarangaySchema>;
export type ListBarangayQuery = z.infer<typeof listBarangayQuerySchema>;
