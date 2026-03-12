import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Ingredient } from '../lib/types';

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  return api.get<Ingredient[]>(
    `${API_ENDPOINTS.INGREDIENT_SEARCH}?search=${encodeURIComponent(query)}`,
    { skipAuth: true },
  );
}

export async function getIngredients(filters?: { search?: string }): Promise<Ingredient[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  const query = params.toString();
  return api.get<Ingredient[]>(
    query ? `${API_ENDPOINTS.INGREDIENTS_ALL}?${query}` : API_ENDPOINTS.INGREDIENTS_ALL,
    { skipAuth: true },
  );
}

export async function getIngredientBySlug(slug: string): Promise<Ingredient> {
  return api.get<Ingredient>(API_ENDPOINTS.INGREDIENT_BY_SLUG(slug), { skipAuth: true });
}
