import { apiClient } from '../utils/api-client';
import { Patient, Consent } from '../types';

export interface PortalConsentPayload {
  grantedToFacilityId?: string;
  purpose?: string;
  scope?: string;
  validTo?: string;
}

export const portalService = {
  myRecord() {
    return apiClient<{ patient: Patient }>('/portal/me');
  },
  myConsents() {
    return apiClient<{ consents: Consent[] }>('/portal/me/consents');
  },
  createConsent(payload: PortalConsentPayload) {
    return apiClient<{ consent: Consent }>('/portal/me/consents', { method: 'POST', body: payload });
  },
  revokeConsent(id: string) {
    return apiClient<{ consent: Consent }>(`/portal/me/consents/${id}/revoke`, { method: 'PUT' });
  },
};
