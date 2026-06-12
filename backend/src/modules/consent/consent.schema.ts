import { z } from 'zod';

export const createConsentSchema = z.object({
  patientId: z.string().min(1),
  grantedToFacilityId: z.string().optional(), // omit = all participating facilities
  purpose: z.enum(['TREATMENT', 'EMERGENCY', 'PUBLIC_HEALTH']).optional().default('TREATMENT'),
  scope: z.enum(['SUMMARY', 'FULL']).optional().default('SUMMARY'),
  validTo: z.coerce.date().optional(),
});

export const listConsentQuerySchema = z.object({
  patientId: z.string().optional(),
});

export type CreateConsentInput = z.infer<typeof createConsentSchema>;
export type ListConsentQuery = z.infer<typeof listConsentQuerySchema>;
