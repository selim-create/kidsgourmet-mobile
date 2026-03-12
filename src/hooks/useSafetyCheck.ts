import useSWR from 'swr';
import { checkIngredientSafety } from '../services/safety-service';
import type { SafetyCheck, Recipe } from '../lib/types';
import { useActiveChild } from '../contexts/ActiveChildContext';
import { calculateAgeInMonths } from '../utils/ageCalculator';

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

/**
 * Check a recipe's safety for the currently active child.
 * Checks up to the first 4 ingredients via the API, and also
 * validates the recipe's age groups client-side.
 */
export function useRecipeSafetyCheck(recipe: Recipe | null | undefined) {
  const { activeChild } = useActiveChild();

  const ageMonths = activeChild?.birth_date
    ? calculateAgeInMonths(activeChild.birth_date)
    : null;

  // Build a composite key for up to 4 ingredients
  const ingredients = recipe?.ingredients?.slice(0, 4) ?? [];
  const key =
    recipe && ageMonths !== null && ingredients.length > 0
      ? `recipe-safety:${recipe.id}:${ageMonths}`
      : null;

  const { data, error, isLoading } = useSWR<SafetyCheck[]>(key, async () => {
    if (!ageMonths) return [];
    const results = await Promise.allSettled(
      ingredients.map((ing) => checkIngredientSafety(ing.name, ageMonths)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<SafetyCheck> => r.status === 'fulfilled')
      .map((r) => r.value);
  });

  // Also derive a basic age-group check client-side
  let ageGroupSafe: boolean | null = null;
  if (recipe?.age_groups && recipe.age_groups.length > 0 && ageMonths !== null) {
    ageGroupSafe = recipe.age_groups.some((ag) => {
      const min = ag.min_age ?? 0;
      const max = ag.max_age ?? Infinity;
      return ageMonths >= min && ageMonths <= max;
    });
  }

  return {
    safetyChecks: data ?? [],
    ageGroupSafe,
    isLoading,
    error,
    hasActiveChild: Boolean(activeChild),
  };
}
