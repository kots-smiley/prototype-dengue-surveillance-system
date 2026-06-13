import { apiClient, buildQuery } from '../utils/api-client';
import { Medication } from '../types';

export interface MedicationPayload {
  patientId: string;
  drug: string;
  dose?: string;
  frequency?: string;
  route?: string;
  notes?: string;
}

export const medicationService = {
  list(patientId: string, status?: string) {
    return apiClient<{ medications: Medication[] }>(
      `/medications${buildQuery({ patientId, status })}`
    );
  },

  create(payload: MedicationPayload) {
    return apiClient<{ medication: Medication }>('/medications', { method: 'POST', body: payload });
  },

  update(id: string, payload: Partial<MedicationPayload> & { status?: string }) {
    return apiClient<{ medication: Medication }>(`/medications/${id}`, { method: 'PUT', body: payload });
  },

  discontinue(id: string) {
    return apiClient<{ medication: Medication }>(`/medications/${id}`, {
      method: 'PUT',
      body: { status: 'DISCONTINUED' },
    });
  },

  remove(id: string) {
    return apiClient<null>(`/medications/${id}`, { method: 'DELETE' });
  },
};
