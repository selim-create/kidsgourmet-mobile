import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Ingredient } from '../lib/types';

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  return api.get<Ingredient[]>(
    `${API_ENDPOINTS.INGREDIENTS}?search=${encodeURIComponent(query)}`,
  );
}

export async function getIngredients(): Promise<Ingredient[]> {
  return api.get<Ingredient[]>(API_ENDPOINTS.INGREDIENTS, { skipAuth: true });
}
