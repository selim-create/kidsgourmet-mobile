import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { SafetyCheck, SafetyCheckResult, BatchSafetyResult } from '../lib/types';

export async function checkRecipeSafety(
  recipeId: number,
  childId: number,
): Promise<SafetyCheckResult> {
  return api.post<SafetyCheckResult>(API_ENDPOINTS.SAFETY_CHECK_RECIPE, {
    recipe_id: recipeId,
    child_id: childId,
  });
}

export async function checkIngredientSafety(
  ingredientId: number | string,
  childId: number,
): Promise<SafetyCheckResult> {
  return api.post<SafetyCheckResult>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT, {
    ingredient_id: ingredientId,
    child_id: childId,
  });
}

export async function batchCheckSafety(
  recipeIds: number[],
  childId: number,
): Promise<BatchSafetyResult[]> {
  return api.post<BatchSafetyResult[]>(API_ENDPOINTS.SAFETY_BATCH_CHECK, {
    recipe_ids: recipeIds,
    child_id: childId,
  });
}

/** @deprecated Use checkIngredientSafety with child_id instead */
export async function checkIngredientSafetyByName(
  ingredient: string,
  ageMonths: number,
): Promise<SafetyCheck> {
  return api.post<SafetyCheck>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT, {
    ingredient,
    age_months: ageMonths,
  });
}

export async function getSafetyData(): Promise<SafetyCheck[]> {
  return api.get<SafetyCheck[]>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT);
}
