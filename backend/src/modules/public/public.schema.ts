import { z } from 'zod';

export const forecastQuerySchema = z.object({
  weeks: z.string().optional(),
  diseaseId: z.string().optional(),
});

export const timeSeriesQuerySchema = z.object({
  months: z.string().optional(),
  barangayId: z.string().optional(),
  diseaseId: z.string().optional(),
});

export type ForecastQuery = z.infer<typeof forecastQuerySchema>;
export type TimeSeriesQuery = z.infer<typeof timeSeriesQuerySchema>;
