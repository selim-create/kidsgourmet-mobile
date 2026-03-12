import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe } from '../lib/types';

export async function getFavorites(): Promise<Recipe[]> {
  return api.get<Recipe[]>(API_ENDPOINTS.FAVORITES);
}

export async function toggleFavorite(recipeId: number): Promise<{ is_favorite: boolean }> {
  return api.post<{ is_favorite: boolean }>(
    API_ENDPOINTS.FAVORITE_TOGGLE(recipeId),
  );
}

export async function removeFavorite(recipeId: number): Promise<void> {
  return api.delete(API_ENDPOINTS.FAVORITE_TOGGLE(recipeId));
}
