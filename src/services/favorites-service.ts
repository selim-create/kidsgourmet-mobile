import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe, FavoriteCollection } from '../lib/types';

export async function getFavorites(): Promise<Recipe[]> {
  return api.get<Recipe[]>(API_ENDPOINTS.USER_FAVORITES);
}

export async function toggleFavorite(
  recipeId: number,
): Promise<{ is_favorite: boolean }> {
  return api.post<{ is_favorite: boolean }>(API_ENDPOINTS.USER_FAVORITES_TOGGLE, {
    item_id: recipeId,
    item_type: 'recipe',
  });
}

export async function toggleIngredientFavorite(
  ingredientId: number,
): Promise<{ is_favorite: boolean }> {
  return api.post<{ is_favorite: boolean }>(API_ENDPOINTS.USER_FAVORITES_TOGGLE, {
    item_id: ingredientId,
    item_type: 'ingredient',
  });
}

export async function getFavoriteCollections(): Promise<FavoriteCollection[]> {
  return api.get<FavoriteCollection[]>(API_ENDPOINTS.USER_FAVORITES_COLLECTIONS);
}
