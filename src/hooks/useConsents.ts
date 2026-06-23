import useSWR from 'swr';
import { getConsents, updateConsent, getConsentHistory } from '../services/consent-service';
import type { UserConsent, UserConsentHistoryEntry, ConsentType } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export function useConsents() {
  const { isAuthenticated } = useAuth();

  const key = isAuthenticated ? API_ENDPOINTS.USER_CONSENTS : null;

  const { data, error, isLoading, mutate } = useSWR<UserConsent[]>(key, () => getConsents());

  const toggle = async (type: ConsentType, value: boolean) => {
    const optimistic = (data ?? []).map((c) => (c.type === type ? { ...c, value } : c));
    await mutate(
      async (current) => {
        const updated = await updateConsent(type, value);
        const list = current ?? [];
        const existing = list.find((c) => c.type === type);
        if (existing) {
          return list.map((c) => (c.type === type ? updated : c));
        }
        return [...list, updated];
      },
      { optimisticData: optimistic, rollbackOnError: true },
    );
  };

  return {
    consents: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refresh: mutate,
    toggle,
    getConsentValue: (type: ConsentType) =>
      (Array.isArray(data) ? data : []).find((c) => c.type === type)?.value ?? false,
  };
}

export function useConsentHistory(type?: ConsentType) {
  const { isAuthenticated } = useAuth();
  const key = isAuthenticated
    ? type
      ? `${API_ENDPOINTS.USER_CONSENT_HISTORY}?type=${type}`
      : API_ENDPOINTS.USER_CONSENT_HISTORY
    : null;

  const { data, error, isLoading } = useSWR<UserConsentHistoryEntry[]>(key, () =>
    getConsentHistory(type),
  );

  return {
    history: Array.isArray(data) ? data : [],
    isLoading,
    error,
  };
}
