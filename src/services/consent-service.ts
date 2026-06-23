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
  return api.patch<UserConsent>(API_ENDPOINTS.USER_CONSENTS, { type, value });
}

export async function getConsentHistory(type?: ConsentType): Promise<UserConsentHistoryEntry[]> {
  const url = type
    ? `${API_ENDPOINTS.USER_CONSENT_HISTORY}?type=${type}`
    : API_ENDPOINTS.USER_CONSENT_HISTORY;
  const res = await api.get<UserConsentHistoryResponse | UserConsentHistoryEntry[]>(url);
  if (Array.isArray(res)) return res;
  return res.history ?? [];
}
