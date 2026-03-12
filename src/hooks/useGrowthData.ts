import useSWR from 'swr';
import { getGrowthData } from '../services/growth-service';
import type { GrowthData } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useGrowthData() {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  const key =
    isAuthenticated && activeChild
      ? API_ENDPOINTS.GROWTH_RECORD(activeChild.id)
      : null;

  const { data, error, isLoading, mutate } = useSWR<GrowthData>(
    key,
    () => getGrowthData(activeChild!.id),
  );

  return {
    growthData: data,
    isLoading,
    error,
    mutate,
  };
}
