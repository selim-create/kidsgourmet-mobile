import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe } from '../lib/types';

export async function getRecommendations(childId?: string | number): Promise<Recipe[]> {
  const params = childId ? `?child_id=${childId}` : '';
  return api.get<Recipe[]>(`${API_ENDPOINTS.RECOMMENDATIONS_DAILY}${params}`);
}

export async function getDashboardRecommendations(childId: string | number): Promise<Recipe[]> {
  try {
    return await api.get<Recipe[]>(`${API_ENDPOINTS.RECOMMENDATIONS_DASHBOARD}?child_id=${childId}`);
  } catch (err) {
    if (__DEV__) {
      console.warn('[KG] getDashboardRecommendations: endpoint not available on backend', String(err));
    }
    return [];
  }
}
