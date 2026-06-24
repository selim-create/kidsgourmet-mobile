import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getCurrentMealPlan, getMealPlan } from '../services/meal-plan-service';
import type { MealPlan } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function useMealPlan(childId?: string, year?: number, week?: number) {
  const { isAuthenticated } = useAuth();

  const key =
    isAuthenticated && childId
      ? year !== undefined && week !== undefined
        ? ['meal-plan', childId, year, week]
        : API_ENDPOINTS.MEAL_PLANS_ACTIVE(childId)
      : null;

  const fetcher = () =>
    childId
      ? year !== undefined && week !== undefined
        ? getMealPlan(childId, year, week)
        : getCurrentMealPlan(childId)
      : null;

  const { data, error, isLoading, mutate } = useSWR<MealPlan | null>(key, fetcher);

  return {
    mealPlan: data,
    isLoading,
    error,
    mutate,
  };
}
