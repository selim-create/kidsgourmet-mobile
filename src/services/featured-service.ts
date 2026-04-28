import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe } from '../lib/types';

export interface FeaturedItem {
  id: number;
  type: 'recipe' | 'post' | 'question' | 'ingredient' | 'sponsor';
  title: string;
  slug: string;
  image?: string;
  excerpt?: string;
  date: string;
  meta: {
    age_group?: string;
    age_group_color?: string;
    prep_time?: string;
    category?: string;
    author?: string;
    author_avatar?: string;
    author_name?: string;
    author_initials?: string;
    answer_count?: number;
    start_age?: string;
    allergy_risk?: string;
    season?: string;
    sponsor_name?: string;
    sponsor_logo?: string;
    sponsor_url?: string;
    direct_redirect?: boolean | string;
  };
}

export async function getFeatured(): Promise<{
  recipes: Recipe[];
  blog_posts?: unknown[];
}> {
  return api.get(API_ENDPOINTS.FEATURED);
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  return api.get<Recipe[]>(API_ENDPOINTS.FEATURED_RECIPES);
}

export async function getAllFeatured(limit = 5): Promise<FeaturedItem[]> {
  try {
    const response = await api.get<{ success: boolean; data: FeaturedItem[] }>(
      `${API_ENDPOINTS.FEATURED}?limit=${limit}`
    );
    return response?.data || [];
  } catch {
    return [];
  }
}
