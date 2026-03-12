import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getMealTypes } from '../services/taxonomy-service';
import type { MealType } from '../lib/types';

export function useMealTypes() {
  const { data, error, isLoading } = useSWR<MealType[]>(
    API_ENDPOINTS.MEAL_TYPES,
    () => getMealTypes(),
    { revalidateOnFocus: false },
  );

  return {
    mealTypes: data ?? [],
    isLoading,
    error,
  };
}
