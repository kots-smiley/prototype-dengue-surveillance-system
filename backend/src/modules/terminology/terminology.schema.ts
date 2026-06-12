import { z } from 'zod';

export const listTerminologyQuerySchema = z.object({
  system: z.enum(['ICD10', 'LOINC', 'SNOMED', 'ATC']).optional(),
  search: z.string().optional(),
});

export type ListTerminologyQuery = z.infer<typeof listTerminologyQuerySchema>;
