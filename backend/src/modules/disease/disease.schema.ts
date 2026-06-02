import { z } from 'zod';

const categoryEnum = z.enum([
  'VECTOR_BORNE',
  'WATER_BORNE',
  'AIRBORNE',
  'DIRECT_CONTACT',
  'OTHER',
]);

export const createDiseaseSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).toUpperCase(),
  category: categoryEnum,
  description: z.string().optional(),
  isNotifiable: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'color must be a hex value').optional(),
  seasonalMonths: z.array(z.number().int().min(1).max(12)).optional().default([]),
  caseThreshold: z.number().int().min(1).optional().default(10),
  spikePercentage: z.number().int().min(1).max(1000).optional().default(50),
});

export const updateDiseaseSchema = createDiseaseSchema.partial();

export const listDiseaseQuerySchema = z.object({
  category: categoryEnum.optional(),
  isActive: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
});

export type CreateDiseaseInput = z.infer<typeof createDiseaseSchema>;
export type UpdateDiseaseInput = z.infer<typeof updateDiseaseSchema>;
export type ListDiseaseQuery = z.infer<typeof listDiseaseQuerySchema>;
