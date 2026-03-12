import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe } from '../lib/types';

export async function getFeatured(): Promise<{
  recipes: Recipe[];
  blog_posts?: unknown[];
}> {
  return api.get(API_ENDPOINTS.FEATURED);
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return api.get<Recipe[]>(API_ENDPOINTS.FEATURED_RECIPES);
}
