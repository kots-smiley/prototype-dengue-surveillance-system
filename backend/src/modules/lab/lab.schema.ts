import { z } from 'zod';

const labStatusEnum = z.enum(['ORDERED', 'RESULTED', 'CANCELLED']);

export const createLabSchema = z.object({
  patientId: z.string().min(1),
  encounterId: z.string().optional(),
  testName: z.string().min(1),
  loincCode: z.string().optional(),
  status: labStatusEnum.optional().default('ORDERED'),
  value: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  resultDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateLabSchema = z.object({
  encounterId: z.string().optional(),
  testName: z.string().min(1).optional(),
  loincCode: z.string().optional(),
  status: labStatusEnum.optional(),
  value: z.string().optional(),
  unit: z.string().optional(),
  referenceRange: z.string().optional(),
  resultDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const listLabQuerySchema = z.object({
  patientId: z.string().optional(),
  encounterId: z.string().optional(),
  status: labStatusEnum.optional(),
});

export type CreateLabInput = z.infer<typeof createLabSchema>;
export type UpdateLabInput = z.infer<typeof updateLabSchema>;
export type ListLabQuery = z.infer<typeof listLabQuerySchema>;
