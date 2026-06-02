import { apiClient, buildQuery } from '../utils/api-client';
import {
  DashboardStats,
  CaseTrend,
  BarangayRanking,
  DiseaseBreakdown,
  BarangayCaseData,
} from '../types';

interface ScopeParams {
  diseaseId?: string;
  barangayId?: string;
}

export const dashboardService = {
  stats(params: ScopeParams = {}) {
    return apiClient<{ stats: DashboardStats }>(`/dashboard/stats${buildQuery(params)}`);
  },

  trends(params: ScopeParams & { months?: number } = {}) {
    return apiClient<{ trends: CaseTrend[] }>(`/dashboard/trends${buildQuery(params)}`);
  },

  rankings(params: { year?: number; limit?: number; diseaseId?: string } = {}) {
    return apiClient<{ rankings: BarangayRanking[] }>(
      `/dashboard/rankings${buildQuery(params)}`
    );
  },

  diseaseBreakdown(params: ScopeParams = {}) {
    return apiClient<{ breakdown: DiseaseBreakdown[] }>(
      `/dashboard/disease-breakdown${buildQuery(params)}`
    );
  },

  barangayCases(params: ScopeParams = {}) {
    return apiClient<BarangayCaseData[]>(`/dashboard/barangay-cases${buildQuery(params)}`);
  },
};
