import { apiClient, buildQuery } from '../utils/api-client';
import { Patient, PaginationMeta } from '../types';

export interface PatientPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate: string;
  sex: string;
  civilStatus?: string;
  contactNumber?: string;
  address?: string;
  barangayId?: string;
  philhealthNo?: string;
  bloodType?: string;
  consentGiven?: boolean;
  notes?: string;
  isActive?: boolean;
}

export interface PatientListParams {
  search?: string;
  barangayId?: string;
  isActive?: string;
  page?: number;
  limit?: number;
}

export const patientService = {
  list(params: PatientListParams = {}) {
    return apiClient<{ items: Patient[]; pagination: PaginationMeta }>(
      `/patients${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ patient: Patient }>(`/patients/${id}`);
  },

  create(payload: PatientPayload) {
    return apiClient<{ patient: Patient }>('/patients', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<PatientPayload>) {
    return apiClient<{ patient: Patient }>(`/patients/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/patients/${id}`, { method: 'DELETE' });
  },
};
