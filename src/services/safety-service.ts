import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { SafetyCheck } from '../lib/types';

export async function checkIngredientSafety(
  ingredient: string,
  ageMonths: number,
): Promise<SafetyCheck> {
  return api.post<SafetyCheck>(API_ENDPOINTS.SAFETY_CHECK, {
    ingredient,
    age_months: ageMonths,
  });
}

export async function getSafetyData(): Promise<SafetyCheck[]> {
  return api.get<SafetyCheck[]>(API_ENDPOINTS.SAFETY);
}
