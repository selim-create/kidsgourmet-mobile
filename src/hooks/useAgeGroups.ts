import useSWR from 'swr';
import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { AgeGroup } from '../lib/types';

export function useAgeGroups() {
  const { data, error, isLoading } = useSWR<AgeGroup[]>(
    API_ENDPOINTS.AGE_GROUPS,
    () => api.get<AgeGroup[]>(API_ENDPOINTS.AGE_GROUPS, { skipAuth: true }),
  );

  return {
    ageGroups: data ?? [],
    isLoading,
    error,
  };
}
