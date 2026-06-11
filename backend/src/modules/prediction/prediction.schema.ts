import { z } from 'zod';

export const predictionQuerySchema = z.object({
  diseaseId: z.string().optional(),
  barangayId: z.string().optional(),
  months: z.string().optional(),
  horizon: z.string().optional(),
});

export const barangayPredictionQuerySchema = z.object({
  diseaseId: z.string().optional(),
  barangayId: z.string().optional(),
  limit: z.string().optional(),
});

export type PredictionQuery = z.infer<typeof predictionQuerySchema>;
export type BarangayPredictionQuery = z.infer<typeof barangayPredictionQuerySchema>;

export const PREDICTION_DISCLAIMER =
  'This forecast uses statistical time-series modeling (AutoARIMA) on historical case counts. It supports surveillance planning only and is NOT a medical diagnostic or outbreak confirmation tool.';
