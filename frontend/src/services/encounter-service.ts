import { apiClient, buildQuery } from '../utils/api-client';
import { Encounter, PaginationMeta, PrescriptionItem } from '../types';

export interface VitalSignPayload {
  systolic?: number;
  diastolic?: number;
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  oxygenSat?: number;
}

export interface DiagnosisPayload {
  diseaseId?: string;
  icd10Code?: string;
  description: string;
  certainty?: string;
  isPrimary?: boolean;
}

export interface PrescriptionPayload {
  items: PrescriptionItem[];
  notes?: string;
}

export interface EncounterPayload {
  patientId: string;
  barangayId?: string;
  type?: string;
  encounterDate?: string;
  chiefComplaint?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  vitalSign?: VitalSignPayload;
  diagnoses?: DiagnosisPayload[];
  prescriptions?: PrescriptionPayload[];
}

export interface EncounterListParams {
  patientId?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export const encounterService = {
  list(params: EncounterListParams = {}) {
    return apiClient<{ items: Encounter[]; pagination: PaginationMeta }>(
      `/encounters${buildQuery(params)}`
    );
  },

  getById(id: string) {
    return apiClient<{ encounter: Encounter }>(`/encounters/${id}`);
  },

  create(payload: EncounterPayload) {
    return apiClient<{ encounter: Encounter }>('/encounters', { method: 'POST', body: payload });
  },

  update(id: string, payload: Omit<EncounterPayload, 'patientId'>) {
    return apiClient<{ encounter: Encounter }>(`/encounters/${id}`, { method: 'PUT', body: payload });
  },

  remove(id: string) {
    return apiClient<null>(`/encounters/${id}`, { method: 'DELETE' });
  },
};
