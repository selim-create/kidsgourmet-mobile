import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { NutritionSummary } from '../lib/types';

export async function getNutritionSummary(
  childId: string | number,
  period?: 'day' | 'week' | 'month',
): Promise<NutritionSummary | null> {
  const params = new URLSearchParams({ child_id: String(childId) });
  if (period) params.set('period', period);

  try {
    return await api.get<NutritionSummary>(
      `${API_ENDPOINTS.NUTRITION_WEEKLY_SUMMARY}?${params.toString()}`,
    );
  } catch (err) {
    if (__DEV__) {
      console.warn('[KG] getNutritionSummary: endpoint not available on backend', String(err));
    }
    return null;
  }
}

export async function getMissingNutrients(childId: string | number): Promise<NutritionSummary | null> {
  try {
    return await api.get<NutritionSummary>(
      `${API_ENDPOINTS.NUTRITION_MISSING_NUTRIENTS}?child_id=${childId}`,
    );
  } catch (err) {
    if (__DEV__) {
      console.warn('[KG] getMissingNutrients: endpoint not available on backend', String(err));
    }
    return null;
  }
}
