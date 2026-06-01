import { z } from 'zod';

export const statsQuerySchema = z.object({
  diseaseId: z.string().optional(),
  barangayId: z.string().optional(),
});

export const trendsQuerySchema = z.object({
  months: z.string().optional(),
  diseaseId: z.string().optional(),
  barangayId: z.string().optional(),
});

export const rankingsQuerySchema = z.object({
  year: z.string().optional(),
  limit: z.string().optional(),
  diseaseId: z.string().optional(),
});

export type StatsQuery = z.infer<typeof statsQuerySchema>;
export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type RankingsQuery = z.infer<typeof rankingsQuerySchema>;
