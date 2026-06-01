import { apiClient, buildQuery } from '../utils/api-client';
import { Case, PaginationMeta } from '../types';

export interface CasePayload {
  diseaseId: string;
  barangayId: string;
  dateReported: string;
  onsetDate?: string;
  age?: number;
  ageGroup?: string;
  sex?: string;
  status: string;
  outcome?: string;
  source: string;
  notes?: string;
}

export interface CaseListParams {
  diseaseId?: string;
  barangayId?: string;
  status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const caseService = {
  list(params: CaseListParams = {}) {
    return apiClient<{ items: Case[]; pagination: PaginationMeta }>(
      `/cases${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ case: Case }>(`/cases/${id}`);
  },

  create(payload: CasePayload) {
    return apiClient<{ case: Case }>('/cases', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<CasePayload>) {
    return apiClient<{ case: Case }>(`/cases/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/cases/${id}`, { method: 'DELETE' });
  },
};
