import useSWR, { useSWRConfig } from 'swr';
import { getConsents, updateConsent, getConsentHistory } from '../services/consent-service';
import type { UserConsent, UserConsentHistoryEntry, ConsentType } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

const CONSENT_HISTORY_ENABLED = false;

export function useConsents() {
  const { isAuthenticated } = useAuth();
  const { mutate: globalMutate } = useSWRConfig();

  const key = isAuthenticated ? API_ENDPOINTS.USER_CONSENTS : null;

  const { data, error, isLoading, mutate } = useSWR<UserConsent[]>(key, () => getConsents());

  const toggle = async (type: ConsentType, consented: boolean) => {
    const list = Array.isArray(data) ? data : [];
    const hasConsent = list.some((c) => c.consent_type === type);
    const optimistic = hasConsent
      ? list.map((c) => (c.consent_type === type ? { ...c, consented } : c))
      : [...list, { consent_type: type, consented }];

    await mutate(
      async (current) => {
        const success = await updateConsent(type, consented);
        if (!success) throw new Error('Consent update failed');

        const safeCurrent = Array.isArray(current) ? current : [];
        const existing = safeCurrent.find((c) => c.consent_type === type);
        if (existing) {
          return safeCurrent.map((c) => (c.consent_type === type ? { ...c, consented } : c));
        }
        return [...safeCurrent, { consent_type: type, consented }];
      },
      { optimisticData: optimistic, rollbackOnError: true, revalidate: true },
    );
    if (CONSENT_HISTORY_ENABLED) {
      await globalMutate(API_ENDPOINTS.USER_CONSENT_HISTORY);
    }
    await mutate();
  };

  return {
    consents: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refresh: mutate,
    toggle,
    getConsentValue: (type: ConsentType) =>
      (Array.isArray(data) ? data : []).find((c) => c.consent_type === type)?.consented ?? false,
  };
}

export function useConsentHistory(type?: ConsentType) {
  const { isAuthenticated } = useAuth();
  const key = isAuthenticated && CONSENT_HISTORY_ENABLED
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
