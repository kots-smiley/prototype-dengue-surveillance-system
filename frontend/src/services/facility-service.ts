import { apiClient, buildQuery } from '../utils/api-client';
import { Facility } from '../types';

export interface FacilityPayload {
  name: string;
  code: string;
  type: string;
  barangayId?: string;
  address?: string;
  contactNumber?: string;
  isActive?: boolean;
}

export const facilityService = {
  list(params: { type?: string; barangayId?: string; isActive?: string; search?: string } = {}) {
    return apiClient<{ facilities: Facility[] }>(`/facilities${buildQuery(params)}`);
  },

  getById(id: string) {
    return apiClient<{ facility: Facility }>(`/facilities/${id}`);
  },

  create(payload: FacilityPayload) {
    return apiClient<{ facility: Facility }>('/facilities', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<FacilityPayload>) {
    return apiClient<{ facility: Facility }>(`/facilities/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/facilities/${id}`, { method: 'DELETE' });
  },
};
