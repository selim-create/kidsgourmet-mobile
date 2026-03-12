import useSWR from 'swr';
import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { DietType } from '../lib/types';

export function useDietTypes() {
  const { data, error, isLoading } = useSWR<DietType[]>(
    API_ENDPOINTS.DIET_TYPES,
    () => api.get<DietType[]>(API_ENDPOINTS.DIET_TYPES, { skipAuth: true }),
  );

  return {
    dietTypes: data ?? [],
    isLoading,
    error,
  };
}
