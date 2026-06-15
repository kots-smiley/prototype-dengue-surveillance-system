import { apiClient, buildQuery } from '../utils/api-client';
import { RiskReport, PaginationMeta } from '../types';

export interface RiskReportPayload {
  barangayId: string;
  category: string;
  dateReported?: string;
  stagnantWater?: boolean;
  poorWasteDisposal?: boolean;
  cloggedDrainage?: boolean;
  housingCongestion?: boolean;
  unsafeWaterSource?: boolean;
  poorSanitation?: boolean;
  openDefecation?: boolean;
  foodContamination?: boolean;
  overcrowding?: boolean;
  poorVentilation?: boolean;
  activeRespiratoryCase?: boolean;
  photoUrl?: string;
  notes?: string;
}

export interface RiskReportListParams {
  barangayId?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const riskReportService = {
  list(params: RiskReportListParams = {}) {
    return apiClient<{ items: RiskReport[]; pagination: PaginationMeta }>(
      `/reports${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ report: RiskReport }>(`/reports/${id}`);
  },

  create(payload: RiskReportPayload) {
    return apiClient<{ report: RiskReport }>('/reports', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<RiskReportPayload>) {
    return apiClient<{ report: RiskReport }>(`/reports/${id}`, { method: 'PUT', body: payload });
  },

  review(id: string, action: 'approve' | 'reject', rejectionReason?: string) {
    return apiClient<{ report: RiskReport }>(`/reports/${id}/status`, {
      method: 'PATCH',
      body: { action, rejectionReason },
    });
  },

  remove(id: string) {
    return apiClient<null>(`/reports/${id}`, { method: 'DELETE' });
  },
};
