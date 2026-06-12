import { z } from 'zod';

export const portalConsentSchema = z.object({
  grantedToFacilityId: z.string().optional(),
  purpose: z.enum(['TREATMENT', 'EMERGENCY', 'PUBLIC_HEALTH']).optional().default('TREATMENT'),
  scope: z.enum(['SUMMARY', 'FULL']).optional().default('SUMMARY'),
  validTo: z.coerce.date().optional(),
});

export type PortalConsentInput = z.infer<typeof portalConsentSchema>;
