import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { NutritionSummary } from '../lib/types';

export async function getNutritionSummary(
  childId: number,
  period?: 'day' | 'week' | 'month',
): Promise<NutritionSummary> {
  const params = new URLSearchParams({ child_id: String(childId) });
  if (period) params.set('period', period);

  return api.get<NutritionSummary>(
    `${API_ENDPOINTS.NUTRITION_WEEKLY_SUMMARY}?${params.toString()}`,
  );
}

export async function getMissingNutrients(childId: number): Promise<NutritionSummary> {
  return api.get<NutritionSummary>(
    `${API_ENDPOINTS.NUTRITION_MISSING_NUTRIENTS}?child_id=${childId}`,
  );
}
