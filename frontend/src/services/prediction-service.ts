import { apiClient, buildQuery } from '../utils/api-client';
import { PredictionResult, BarangayForecast } from '../types';

export interface PredictionParams {
  diseaseId?: string;
  barangayId?: string;
  months?: number;
  horizon?: number;
}

export interface BarangayPredictionParams {
  diseaseId?: string;
  barangayId?: string;
  limit?: number;
}

export const predictionService = {
  getPredictions(params: PredictionParams = {}) {
    return apiClient<PredictionResult>(`/predictions${buildQuery(params)}`);
  },

  getBarangayPredictions(params: BarangayPredictionParams = {}) {
    return apiClient<{ barangays: BarangayForecast[] }>(
      `/predictions/barangays${buildQuery(params)}`
    );
  },
};
