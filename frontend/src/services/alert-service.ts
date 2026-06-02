import { apiClient, buildQuery } from '../utils/api-client';
import { Alert, PaginationMeta } from '../types';

export interface AlertListParams {
  barangayId?: string;
  diseaseId?: string;
  status?: string;
  riskLevel?: string;
  page?: number;
  limit?: number;
}

export const alertService = {
  list(params: AlertListParams = {}) {
    return apiClient<{ items: Alert[]; pagination: PaginationMeta }>(
      `/alerts${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ alert: Alert }>(`/alerts/${id}`);
  },

  updateStatus(id: string, status: string) {
    return apiClient<{ alert: Alert }>(`/alerts/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },

  resolve(id: string) {
    return apiClient<{ alert: Alert }>(`/alerts/${id}/resolve`, { method: 'PUT' });
  },
};
