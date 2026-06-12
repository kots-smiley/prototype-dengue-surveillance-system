import { apiClient, buildQuery, getToken } from '../utils/api-client';
import { API_BASE_URL } from '../configuration/constants';
import { Referral, Consent, ClinicalDocument, TerminologyConcept, Encounter } from '../types';

// --- Referrals (ISO 13940 continuity of care) ---
export interface ReferralPayload {
  patientId: string;
  fromFacilityId?: string;
  toFacilityId: string;
  encounterId?: string;
  reason: string;
  clinicalSummary?: string;
  priority?: string;
}

export const referralService = {
  list(params: { patientId?: string; facilityId?: string; direction?: string; status?: string } = {}) {
    return apiClient<{ referrals: Referral[] }>(`/referrals${buildQuery(params)}`);
  },
  create(payload: ReferralPayload) {
    return apiClient<{ referral: Referral }>('/referrals', { method: 'POST', body: payload });
  },
  updateStatus(id: string, status: string) {
    return apiClient<{ referral: Referral }>(`/referrals/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
};

// --- Consent directives (ISO 22600 / RA 10173) ---
export interface ConsentPayload {
  patientId: string;
  grantedToFacilityId?: string;
  purpose?: string;
  scope?: string;
  validTo?: string;
}

export const consentService = {
  list(patientId: string) {
    return apiClient<{ consents: Consent[] }>(`/consents${buildQuery({ patientId })}`);
  },
  create(payload: ConsentPayload) {
    return apiClient<{ consent: Consent }>('/consents', { method: 'POST', body: payload });
  },
  revoke(id: string) {
    return apiClient<{ consent: Consent }>(`/consents/${id}/revoke`, { method: 'PUT' });
  },
};

// --- Clinical documents ---
export interface DocumentPayload {
  patientId: string;
  encounterId?: string;
  type: string;
  title: string;
  format?: string;
  url?: string;
  content?: string;
}

export const documentService = {
  list(patientId: string) {
    return apiClient<{ documents: ClinicalDocument[] }>(`/documents${buildQuery({ patientId })}`);
  },
  create(payload: DocumentPayload) {
    return apiClient<{ document: ClinicalDocument }>('/documents', { method: 'POST', body: payload });
  },
  remove(id: string) {
    return apiClient<null>(`/documents/${id}`, { method: 'DELETE' });
  },
};

// --- Terminology lookups ---
export const terminologyService = {
  list(params: { system?: string; search?: string } = {}) {
    return apiClient<{ concepts: TerminologyConcept[] }>(`/terminology${buildQuery(params)}`);
  },
};

// --- Health Information Exchange ---
export interface SharedRecord {
  summary: Record<string, unknown>;
  timeline: Encounter[];
  breakGlass: boolean;
  purpose: string;
}

export const hieService = {
  getRecord(patientId: string, params: { purpose?: string; breakGlass?: string } = {}) {
    return apiClient<SharedRecord>(`/hie/patients/${patientId}/record${buildQuery(params)}`);
  },
};

// --- FHIR export (returns raw FHIR JSON, not the API envelope) ---
async function fetchFhir(path: string): Promise<unknown> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`FHIR request failed (${res.status})`);
  return res.json();
}

export const fhirService = {
  patient(id: string) {
    return fetchFhir(`/fhir/Patient/${id}`);
  },
  everything(id: string) {
    return fetchFhir(`/fhir/Patient/${id}/$everything`);
  },
  summary(id: string) {
    return fetchFhir(`/fhir/Patient/${id}/$summary`);
  },
};
