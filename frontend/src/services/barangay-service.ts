import { apiClient, buildQuery } from '../utils/api-client';
import { Barangay } from '../types';

export interface BarangayPayload {
  name: string;
  code: string;
  municipality: string;
  province: string;
  population?: number;
}

export const barangayService = {
  list(params: { municipality?: string; province?: string; search?: string } = {}) {
    return apiClient<{ barangays: Barangay[] }>(`/barangays${buildQuery(params)}`);
  },

  getById(id: string) {
    return apiClient<{ barangay: Barangay }>(`/barangays/${id}`);
  },

  create(payload: BarangayPayload) {
    return apiClient<{ barangay: Barangay }>('/barangays', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<BarangayPayload>) {
    return apiClient<{ barangay: Barangay }>(`/barangays/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/barangays/${id}`, { method: 'DELETE' });
  },
};
