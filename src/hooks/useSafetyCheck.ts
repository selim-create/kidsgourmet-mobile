import useSWR from 'swr';
import { checkIngredientSafety, checkIngredientSafetyByName } from '../services/safety-service';
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
    () => checkIngredientSafetyByName(ingredient!, ageMonths!),
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

  // Build a composite key for up to 4 ingredients that have IDs
  const ingredients = recipe?.ingredients?.slice(0, 4) ?? [];
  const key =
    recipe && activeChild && ingredients.length > 0
      ? `recipe-safety:${recipe.id}:${activeChild.id}`
      : null;

  const { data, error, isLoading } = useSWR<SafetyCheck[]>(key, async () => {
    if (!activeChild) return [];
    const ingredientsWithIds = ingredients.filter((ing) => ing.id != null);
    if (__DEV__ && ingredientsWithIds.length < ingredients.length) {
      console.warn(
        `[Safety] Skipping ${ingredients.length - ingredientsWithIds.length} ingredient(s) without IDs`,
      );
    }
    const results = await Promise.allSettled(
      ingredientsWithIds.map(async (ing): Promise<SafetyCheck> => {
          const result = await checkIngredientSafety(ing.id!, activeChild.id);
          const maxSeverity = result.alerts.reduce<string | undefined>((acc, a) => {
            const order = ['critical', 'high', 'medium', 'low'];
            return acc === undefined || order.indexOf(a.severity) < order.indexOf(acc) ? a.severity : acc;
          }, undefined);
          const safetyLevel: SafetyCheck['safety_level'] = result.is_safe
            ? 'safe'
            : maxSeverity === 'critical' || maxSeverity === 'high'
              ? 'avoid'
              : 'caution';
          return {
            ingredient: ing.name,
            age_months: ageMonths ?? 0,
            is_safe: result.is_safe,
            safety_level: safetyLevel,
            notes: result.alerts.length > 0 ? result.alerts[0].message : undefined,
            alternatives: result.alternatives,
          };
        }),
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
    ageMonths,
    isLoading,
    error,
    hasActiveChild: Boolean(activeChild),
  };
}
