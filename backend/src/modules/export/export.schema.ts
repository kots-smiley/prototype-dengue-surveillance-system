import { z } from 'zod';

const formatEnum = z.enum(['csv', 'xlsx', 'excel']).optional().default('csv');

export const exportCasesQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  barangayId: z.string().optional(),
  diseaseId: z.string().optional(),
  format: formatEnum,
});

export const exportReportsQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  barangayId: z.string().optional(),
  category: z.enum(['VECTOR_BORNE', 'WATER_BORNE', 'AIRBORNE']).optional(),
  format: formatEnum,
});

export const exportSummaryQuerySchema = z.object({
  year: z.string().optional(),
  month: z.string().optional(),
  diseaseId: z.string().optional(),
  format: formatEnum,
});

export type ExportCasesQuery = z.infer<typeof exportCasesQuerySchema>;
export type ExportReportsQuery = z.infer<typeof exportReportsQuerySchema>;
export type ExportSummaryQuery = z.infer<typeof exportSummaryQuerySchema>;
