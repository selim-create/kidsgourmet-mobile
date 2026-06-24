import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  ConsentType,
  UserConsent,
  UserConsentHistoryEntry,
  UserConsentsResponse,
  UserConsentHistoryResponse,
} from '../lib/types';

export async function getConsents(): Promise<UserConsent[]> {
  const res = await api.get<UserConsentsResponse | UserConsent[]>(API_ENDPOINTS.USER_CONSENTS);
  if (Array.isArray(res)) return res;
  return res.consents ?? [];
}

export async function updateConsent(type: ConsentType, value: boolean): Promise<UserConsent> {
  // Some backend variants accept `value`, while web-aligned handlers expect `accepted`.
  const response = await api.put<UserConsent | { consent?: UserConsent }>(
    API_ENDPOINTS.USER_CONSENT_UPDATE(type),
    {
      value,
      accepted: value,
    },
  );
  if (typeof response === 'object' && response !== null && 'consent' in response && response.consent) {
    return response.consent;
  }
  return response as UserConsent;
}

export async function getConsentHistory(type?: ConsentType): Promise<UserConsentHistoryEntry[]> {
  const url = type
    ? `${API_ENDPOINTS.USER_CONSENT_HISTORY}?type=${type}`
    : API_ENDPOINTS.USER_CONSENT_HISTORY;
  const res = await api.get<UserConsentHistoryResponse | UserConsentHistoryEntry[]>(url);
  if (Array.isArray(res)) return res;
  return res.history ?? [];
}
