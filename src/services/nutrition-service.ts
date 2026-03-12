import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { NutritionSummary } from '../lib/types';

export async function getNutritionSummary(
  childId?: number,
  period?: 'day' | 'week' | 'month',
): Promise<NutritionSummary> {
  const params = new URLSearchParams();
  if (childId) params.set('child_id', String(childId));
  if (period) params.set('period', period);

  const query = params.toString();
  return api.get<NutritionSummary>(
    query
      ? `${API_ENDPOINTS.NUTRITION_SUMMARY}?${query}`
      : API_ENDPOINTS.NUTRITION_SUMMARY,
  );
}
