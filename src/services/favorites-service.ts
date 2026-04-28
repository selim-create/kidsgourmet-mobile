import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe, FavoriteCollection } from '../lib/types';

export async function getFavorites(): Promise<Recipe[]> {
  const data = await api.get<
    Recipe[] | { items?: Recipe[]; recipes?: Recipe[]; data?: Recipe[] }
  >(API_ENDPOINTS.USER_FAVORITES);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as { items?: Recipe[]; recipes?: Recipe[]; data?: Recipe[] };
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.recipes)) return obj.recipes;
  }
  return [];
}

/**
 * Add a recipe to the user's favorites.
 * POST /kg/v1/user/favorites  { item_id, item_type: 'recipe' }
 */
export async function addFavorite(recipeId: number): Promise<void> {
  await api.post<unknown>(API_ENDPOINTS.USER_FAVORITES, {
    item_id: recipeId,
    item_type: 'recipe',
  });
}

/**
 * Remove a recipe from the user's favorites.
 * DELETE /kg/v1/user/favorites/{id}?type=recipe
 */
export async function removeFavorite(recipeId: number): Promise<void> {
  await api.delete<unknown>(`${API_ENDPOINTS.USER_FAVORITES}/${recipeId}?type=recipe`);
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
