import { z } from 'zod';

export const hieAccessQuerySchema = z.object({
  purpose: z.enum(['TREATMENT', 'EMERGENCY', 'PUBLIC_HEALTH']).optional().default('TREATMENT'),
  breakGlass: z.enum(['true', 'false']).optional(),
});

export type HieAccessQuery = z.infer<typeof hieAccessQuerySchema>;
