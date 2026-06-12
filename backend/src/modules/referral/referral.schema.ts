import { z } from 'zod';

export const createReferralSchema = z.object({
  patientId: z.string().min(1),
  fromFacilityId: z.string().optional(), // defaults to the provider's facility
  toFacilityId: z.string().min(1),
  encounterId: z.string().optional(),
  reason: z.string().min(1),
  clinicalSummary: z.string().optional(),
  priority: z.enum(['ROUTINE', 'URGENT', 'EMERGENCY']).optional().default('ROUTINE'),
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'COMPLETED', 'REJECTED']),
});

export const listReferralQuerySchema = z.object({
  patientId: z.string().optional(),
  facilityId: z.string().optional(),
  direction: z.enum(['INCOMING', 'OUTGOING']).optional(),
  status: z.enum(['REQUESTED', 'ACCEPTED', 'COMPLETED', 'REJECTED']).optional(),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;
export type ListReferralQuery = z.infer<typeof listReferralQuerySchema>;
