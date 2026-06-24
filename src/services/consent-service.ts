import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  ConsentType,
  UserConsent,
  UserConsentHistoryEntry,
  UserConsentsResponse,
  UserConsentHistoryResponse,
} from '../lib/types';

function normalizeConsentType(value: unknown): ConsentType | null {
  if (value === 'terms' || value === 'terms_accepted') return 'terms';
  if (value === 'marketing' || value === 'marketing_consent') return 'marketing';
  if (value === 'sensitive_data' || value === 'sensitive_data_consent') return 'sensitive_data';
  if (value === 'guardian_declaration') return 'guardian_declaration';
  return null;
}

function normalizeConsent(item: UserConsent | Record<string, unknown>): UserConsent | null {
  const raw = item as Record<string, unknown>;
  const consentType = normalizeConsentType(raw.consent_type ?? raw.type);
  if (!consentType) return null;

  return {
    id: typeof raw.id === 'number' ? raw.id : undefined,
    consent_type: consentType,
    consented: Boolean(raw.consented ?? raw.value ?? raw.accepted ?? false),
    consented_at: (raw.consented_at as string | null | undefined) ?? null,
    revoked_at: (raw.revoked_at as string | null | undefined) ?? null,
    version: (raw.version as string | null | undefined) ?? null,
    created_at: raw.created_at as string | undefined,
    updated_at: raw.updated_at as string | undefined,
  };
}

export async function getConsents(): Promise<UserConsent[]> {
  const res = await api.get<UserConsentsResponse | UserConsent[]>(API_ENDPOINTS.USER_CONSENTS);
  const list = Array.isArray(res) ? res : (res.data ?? res.consents ?? []);
  return list
    .map((item) => normalizeConsent(item as UserConsent | Record<string, unknown>))
    .filter((item): item is UserConsent => item !== null);
}

export async function updateConsent(type: ConsentType, consented: boolean): Promise<boolean> {
  const response = await api.put<{ success?: boolean }>(
    API_ENDPOINTS.USER_CONSENT_UPDATE(type),
    {
      consented,
    },
  );
  if (typeof response === 'object' && response !== null && 'success' in response) {
    return response.success !== false;
  }
  return true;
}

export async function getConsentHistory(type?: ConsentType): Promise<UserConsentHistoryEntry[]> {
  const url = type
    ? `${API_ENDPOINTS.USER_CONSENT_HISTORY}?type=${type}`
    : API_ENDPOINTS.USER_CONSENT_HISTORY;
  const res = await api.get<UserConsentHistoryResponse | UserConsentHistoryEntry[]>(url);
  const list = Array.isArray(res) ? res : (res.data ?? res.history ?? []);
  const normalizedHistory: UserConsentHistoryEntry[] = [];

  for (const item of list) {
    const normalized = normalizeConsent(item as UserConsent | Record<string, unknown>);
    if (!normalized) continue;

    const record = item as unknown as Record<string, unknown>;
    normalizedHistory.push({
      ...normalized,
      changed_at: (record.changed_at as string | undefined)
        ?? normalized.updated_at
        ?? normalized.consented_at
        ?? undefined,
      ip: record.ip as string | undefined,
      user_agent: record.user_agent as string | undefined,
    });
  }

  return normalizedHistory;
}
