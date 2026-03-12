import useSWR from 'swr';
import { checkIngredientSafety } from '../services/safety-service';
import type { SafetyCheck } from '../lib/types';

export function useSafetyCheck(ingredient: string | null, ageMonths: number | null) {
  const key =
    ingredient && ageMonths !== null
      ? `safety:${ingredient}:${ageMonths}`
      : null;

  const { data, error, isLoading } = useSWR<SafetyCheck>(
    key,
    () => checkIngredientSafety(ingredient!, ageMonths!),
  );

  return {
    safetyData: data,
    isLoading,
    error,
  };
}
