import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe } from '../lib/types';

export async function getRecommendations(childId?: number): Promise<Recipe[]> {
  const params = childId ? `?child_id=${childId}` : '';
  return api.get<Recipe[]>(`${API_ENDPOINTS.RECOMMENDATIONS_DAILY}${params}`);
}

export async function getDashboardRecommendations(childId: number): Promise<Recipe[]> {
  return api.get<Recipe[]>(`${API_ENDPOINTS.RECOMMENDATIONS_DASHBOARD}?child_id=${childId}`);
}
