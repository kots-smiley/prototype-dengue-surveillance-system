import { apiClient, buildQuery } from '../utils/api-client';
import { Immunization, MaternalRecord, LabResult, Allergy, Problem } from '../types';

export interface ImmunizationPayload {
  patientId: string;
  vaccine: string;
  doseNumber?: number;
  dateGiven: string;
  nextDueDate?: string;
  administeredBy?: string;
  notes?: string;
}

export interface MaternalPayload {
  patientId: string;
  lmp?: string;
  edd?: string;
  gravida?: number;
  para?: number;
  prenatalVisit?: number;
  visitDate?: string;
  notes?: string;
}

export interface LabPayload {
  patientId: string;
  encounterId?: string;
  testName: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  resultDate?: string;
  notes?: string;
}

export interface AllergyPayload {
  patientId: string;
  substance: string;
  reaction?: string;
  severity?: string;
}

export interface ProblemPayload {
  patientId: string;
  name: string;
  status?: string;
  onsetDate?: string;
  notes?: string;
}

export const immunizationService = {
  list(patientId: string) {
    return apiClient<{ immunizations: Immunization[] }>(`/immunizations${buildQuery({ patientId })}`);
  },
  create(payload: ImmunizationPayload) {
    return apiClient<{ immunization: Immunization }>('/immunizations', { method: 'POST', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/immunizations/${id}`, { method: 'DELETE' });
  },
};

export const maternalService = {
  list(patientId: string) {
    return apiClient<{ maternalRecords: MaternalRecord[] }>(`/maternal${buildQuery({ patientId })}`);
  },
  create(payload: MaternalPayload) {
    return apiClient<{ maternalRecord: MaternalRecord }>('/maternal', { method: 'POST', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/maternal/${id}`, { method: 'DELETE' });
  },
};

export const labService = {
  list(patientId: string) {
    return apiClient<{ labResults: LabResult[] }>(`/labs${buildQuery({ patientId })}`);
  },
  create(payload: LabPayload) {
    return apiClient<{ labResult: LabResult }>('/labs', { method: 'POST', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/labs/${id}`, { method: 'DELETE' });
  },
};

export const allergyService = {
  create(payload: AllergyPayload) {
    return apiClient<{ allergy: Allergy }>('/clinical/allergies', { method: 'POST', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/clinical/allergies/${id}`, { method: 'DELETE' });
  },
};

export const problemService = {
  create(payload: ProblemPayload) {
    return apiClient<{ problem: Problem }>('/clinical/problems', { method: 'POST', body: payload });
  },
  update(id: string, payload: Partial<ProblemPayload> & { resolvedAt?: string }) {
    return apiClient<{ problem: Problem }>(`/clinical/problems/${id}`, { method: 'PUT', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/clinical/problems/${id}`, { method: 'DELETE' });
  },
};
