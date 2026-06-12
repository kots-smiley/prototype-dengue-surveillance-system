import { z } from 'zod';

export const createDocumentSchema = z.object({
  patientId: z.string().min(1),
  encounterId: z.string().optional(),
  facilityId: z.string().optional(),
  type: z.enum(['LAB_REPORT', 'REFERRAL_LETTER', 'DISCHARGE_SUMMARY', 'IMAGING', 'OTHER']),
  title: z.string().min(1),
  format: z.enum(['PDF', 'IMAGE', 'TEXT', 'FHIR']).optional().default('TEXT'),
  url: z.string().optional(),
  content: z.string().optional(),
});

export const listDocumentQuerySchema = z.object({
  patientId: z.string().optional(),
  encounterId: z.string().optional(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type ListDocumentQuery = z.infer<typeof listDocumentQuerySchema>;
