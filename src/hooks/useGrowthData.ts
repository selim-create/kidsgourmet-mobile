import useSWR from 'swr';
import { getGrowthChartData, getGrowthData } from '../services/growth-service';
import type { GrowthChartData, GrowthChartType, GrowthData } from '../lib/types';
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

  const { data, error, isLoading, mutate } = useSWR<GrowthData | null>(
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

export function useGrowthChartData(type: GrowthChartType = 'weight_for_age') {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  const key =
    isAuthenticated && activeChild
      ? `growth-chart-${activeChild.id}-${type}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<GrowthChartData | null>(
    key,
    () => getGrowthChartData(activeChild!.id, type),
  );

  return {
    chartData: data,
    isLoading,
    error,
    mutate,
  };
}
