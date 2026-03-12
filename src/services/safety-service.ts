import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { SafetyCheck, SafetyCheckResult, BatchSafetyResult } from '../lib/types';

const SAFE_FALLBACK: SafetyCheckResult = { is_safe: true, alerts: [] };

export async function checkRecipeSafety(
  recipeId: number,
  childId: number,
): Promise<SafetyCheckResult> {
  try {
    return await api.post<SafetyCheckResult>(API_ENDPOINTS.SAFETY_CHECK_RECIPE, {
      recipe_id: recipeId,
      child_id: childId,
    });
  } catch (error) {
    if (__DEV__) console.error('[Safety] Recipe check failed:', error);
    return SAFE_FALLBACK;
  }
}

export async function checkIngredientSafety(
  ingredientId: number | string,
  childId: number,
): Promise<SafetyCheckResult> {
  try {
    return await api.post<SafetyCheckResult>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT, {
      ingredient_id: ingredientId,
      child_id: childId,
    });
  } catch (error) {
    if (__DEV__) console.error('[Safety] Ingredient check failed:', error);
    return SAFE_FALLBACK;
  }
}

export async function batchCheckSafety(
  recipeIds: number[],
  childId: number,
): Promise<BatchSafetyResult[]> {
  try {
    return await api.post<BatchSafetyResult[]>(API_ENDPOINTS.SAFETY_BATCH_CHECK, {
      recipe_ids: recipeIds,
      child_id: childId,
    });
  } catch (error) {
    if (__DEV__) console.error('[Safety] Batch check failed:', error);
    return [];
  }
}

/** @deprecated Use checkIngredientSafety with child_id instead */
export async function checkIngredientSafetyByName(
  ingredient: string,
  ageMonths: number,
): Promise<SafetyCheck> {
  try {
    return await api.post<SafetyCheck>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT, {
      ingredient,
      age_months: ageMonths,
    });
  } catch (error) {
    if (__DEV__) console.error('[Safety] Ingredient name check failed:', error);
    return { ingredient, age_months: ageMonths, is_safe: true };
  }
}

export async function getSafetyData(): Promise<SafetyCheck[]> {
  try {
    return await api.get<SafetyCheck[]>(API_ENDPOINTS.SAFETY_CHECK_INGREDIENT);
  } catch (error) {
    if (__DEV__) console.error('[Safety] Get safety data failed:', error);
    return [];
  }
}
