import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getSpecialConditions } from '../services/taxonomy-service';
import type { SpecialCondition } from '../lib/types';

export function useSpecialConditions() {
  const { data, error, isLoading } = useSWR<SpecialCondition[]>(
    API_ENDPOINTS.SPECIAL_CONDITIONS,
    () => getSpecialConditions(),
    { revalidateOnFocus: false },
  );

  return {
    specialConditions: data ?? [],
    isLoading,
    error,
  };
}
