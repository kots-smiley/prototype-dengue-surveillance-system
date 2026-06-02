import { apiClient, buildQuery } from '../utils/api-client';
import { Disease } from '../types';

export interface DiseasePayload {
  name: string;
  code: string;
  category: string;
  description?: string;
  isNotifiable?: boolean;
  isActive?: boolean;
  color?: string;
  seasonalMonths?: number[];
  caseThreshold?: number;
  spikePercentage?: number;
}

export const diseaseService = {
  list(params: { category?: string; isActive?: string; search?: string } = {}) {
    return apiClient<{ diseases: Disease[] }>(`/diseases${buildQuery(params)}`);
  },

  getById(id: string) {
    return apiClient<{ disease: Disease }>(`/diseases/${id}`);
  },

  create(payload: DiseasePayload) {
    return apiClient<{ disease: Disease }>('/diseases', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<DiseasePayload>) {
    return apiClient<{ disease: Disease }>(`/diseases/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<{ disease: Disease | null }>(`/diseases/${id}`, { method: 'DELETE' });
  },
};
