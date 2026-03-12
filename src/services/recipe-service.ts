import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe, PaginatedResponse, SearchFilters } from '../lib/types';

export async function getRecipes(
  filters: SearchFilters = {},
): Promise<PaginatedResponse<Recipe>> {
  const params = new URLSearchParams();
  if (filters.query) params.set('search', filters.query);
  if (filters.age_group) params.set('age_group', filters.age_group);
  if (filters.meal_type) params.set('meal_type', filters.meal_type);
  if (filters.diet_type) params.set('diet_type', filters.diet_type);
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.max_time) params.set('max_time', String(filters.max_time));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));

  const query = params.toString();
  const endpoint = query
    ? `${API_ENDPOINTS.RECIPES}?${query}`
    : API_ENDPOINTS.RECIPES;

  return api.get<PaginatedResponse<Recipe>>(endpoint);
}

export async function getRecipe(slug: string): Promise<Recipe> {
  return api.get<Recipe>(API_ENDPOINTS.RECIPE(slug));
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return api.get<Recipe[]>(API_ENDPOINTS.FEATURED_RECIPES);
}
