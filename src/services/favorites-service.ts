import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe, FavoriteCollection } from '../lib/types';

export async function getFavorites(): Promise<Recipe[]> {
  const data = await api.get<Recipe[] | { items?: Recipe[]; recipes?: Recipe[] }>(
    API_ENDPOINTS.USER_FAVORITES,
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as { items?: Recipe[]; recipes?: Recipe[] };
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.recipes)) return obj.recipes;
  }
  return [];
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
