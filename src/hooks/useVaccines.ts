import useSWR from 'swr';
import { getVaccines, getVaccinesByChild } from '../services/vaccine-service';
import type { Vaccine } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';

export function useVaccines(childId?: string) {
  const key = childId
    ? API_ENDPOINTS.VACCINES_BY_CHILD(childId)
    : API_ENDPOINTS.VACCINES_MASTER;

  const fetcher = childId
    ? () => getVaccinesByChild(childId)
    : () => getVaccines();

  const { data, error, isLoading, mutate } = useSWR<Vaccine[]>(key, fetcher);

  return {
    vaccines: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}
