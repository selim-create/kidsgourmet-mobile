import useSWR from 'swr';
import { getVaccines } from '../services/vaccine-service';
import type { Vaccine } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';

export function useVaccines() {
  const { data, error, isLoading } = useSWR<Vaccine[]>(
    API_ENDPOINTS.VACCINES,
    () => getVaccines(),
  );

  return {
    vaccines: data ?? [],
    isLoading,
    error,
  };
}
