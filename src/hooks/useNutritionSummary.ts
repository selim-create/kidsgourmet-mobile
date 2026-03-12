import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getNutritionSummary } from '../services/nutrition-service';
import type { NutritionSummary } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useNutritionSummary(period: 'day' | 'week' | 'month' = 'week') {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  const key = isAuthenticated
    ? `${API_ENDPOINTS.NUTRITION_WEEKLY_SUMMARY}?period=${period}${activeChild ? `&child_id=${activeChild.id}` : ''}`
    : null;

  const { data, error, isLoading } = useSWR<NutritionSummary>(
    key,
    () => getNutritionSummary(activeChild?.id, period),
  );

  return {
    summary: data,
    isLoading,
    error,
  };
}
