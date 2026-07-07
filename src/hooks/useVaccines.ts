import useSWR from 'swr';
import { getVaccines, getVaccinesByChild } from '../services/vaccine-service';
import type { Vaccine } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';

type VaccinesHookData = {
  vaccines: Vaccine[];
  birthDate?: string | null;
  hasChildData?: boolean;
};

export function useVaccines(childId?: string) {
  const resolvedChildId = childId ? String(childId) : undefined;
  const key = resolvedChildId
    ? API_ENDPOINTS.VACCINES_BY_CHILD(resolvedChildId)
    : API_ENDPOINTS.VACCINES_MASTER;

  const fetcher = resolvedChildId
    ? async (): Promise<VaccinesHookData> => getVaccinesByChild(resolvedChildId)
    : async (): Promise<VaccinesHookData> => ({ vaccines: await getVaccines(), hasChildData: false });

  const { data, error, isLoading, mutate } = useSWR<VaccinesHookData>(key, fetcher);

  return {
    vaccines: Array.isArray(data?.vaccines) ? data.vaccines : [],
    childBirthDate: data?.birthDate,
    hasChildScheduleData: Boolean(data?.hasChildData),
    isLoading,
    error,
    mutate,
  };
}
