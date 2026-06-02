import { z } from 'zod';

export const updateAlertStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED', 'DISMISSED']),
});

export const listAlertQuerySchema = z.object({
  barangayId: z.string().optional(),
  diseaseId: z.string().optional(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'DISMISSED']).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UpdateAlertStatusInput = z.infer<typeof updateAlertStatusSchema>;
export type ListAlertQuery = z.infer<typeof listAlertQuerySchema>;
