import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getCurrentMealPlan, getMealPlan } from '../services/meal-plan-service';
import type { MealPlan } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function useMealPlan(year?: number, week?: number) {
  const { isAuthenticated } = useAuth();

  const key =
    isAuthenticated
      ? year !== undefined && week !== undefined
        ? `${API_ENDPOINTS.MEAL_PLAN}/${year}/${week}`
        : API_ENDPOINTS.MEAL_PLAN_CURRENT
      : null;

  const fetcher = () =>
    year !== undefined && week !== undefined
      ? getMealPlan(year, week)
      : getCurrentMealPlan();

  const { data, error, isLoading, mutate } = useSWR<MealPlan>(key, fetcher);

  return {
    mealPlan: data,
    isLoading,
    error,
    mutate,
  };
}
