import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Recipe, PaginatedResponse, RecipePaginatedResponse, SearchFilters } from '../lib/types';

// ─── Normalize recipe fields ───────────────────────────────────────────────────

/**
 * Parse a time string like "25 dk" or "1 sa 30 dk" to minutes.
 * Returns the original value if it's already a number.
 */
function parseTimeToMinutes(value: unknown): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string' || !value.trim()) return undefined;
  let minutes = 0;
  const hourMatch = value.match(/(\d+)\s*sa/);
  const minMatch = value.match(/(\d+)\s*dk/);
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  if (minMatch) minutes += parseInt(minMatch[1], 10);
  // If no unit found, try plain number
  if (!hourMatch && !minMatch) {
    const plain = parseInt(value, 10);
    if (!isNaN(plain)) return plain;
  }
  return minutes > 0 ? minutes : undefined;
}

function normalizeRecipe(recipe: Recipe): Recipe {
  return {
    ...recipe,
    // API may return `image` instead of `featured_image`
    featured_image: recipe.featured_image ?? recipe.image,
    // API may return time as strings like "25 dk" — normalize to numbers
    prep_time: parseTimeToMinutes(recipe.prep_time as unknown),
    cook_time: parseTimeToMinutes(recipe.cook_time as unknown),
  };
}

export async function getRecipes(
  filters: SearchFilters = {},
): Promise<PaginatedResponse<Recipe>> {
  const params = new URLSearchParams();
  if (filters.query) params.set('search', filters.query);
  // Use hyphenated param names to match the WordPress custom REST API
  if (filters.age_group) params.set('age-group', filters.age_group);
  if (filters.meal_type) params.set('meal-type', filters.meal_type);
  if (filters.diet_type) params.set('diet-type', filters.diet_type);
  if (filters.special_condition) params.set('special-condition', filters.special_condition);
  if (filters.ingredient) params.set('ingredient', filters.ingredient);
  if (filters.expert_approved) params.set('expert_approved', 'true');
  if (filters.difficulty) params.set('difficulty', filters.difficulty);
  if (filters.max_time) params.set('max_time', String(filters.max_time));
  // WordPress uses `orderby` convention
  if (filters.sort) params.set('orderby', filters.sort);
  if (filters.order) params.set('order', filters.order);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));

  const query = params.toString();
  const endpoint = query
    ? `${API_ENDPOINTS.RECIPES}?${query}`
    : API_ENDPOINTS.RECIPES;

  const raw = await api.get<RecipePaginatedResponse | PaginatedResponse<Recipe>>(endpoint, { skipAuth: true });

  // Handle both API formats: `{ recipes: [] }` and `{ items: [] }`
  if ('recipes' in raw && Array.isArray(raw.recipes)) {
    const typed = raw as RecipePaginatedResponse;
    return {
      items: typed.recipes.map(normalizeRecipe),
      total: typed.total,
      page: typed.page,
      per_page: typed.per_page,
      total_pages: typed.total_pages,
      has_next: typed.page < typed.total_pages,
      has_prev: typed.page > 1,
    };
  }

  const typed = raw as PaginatedResponse<Recipe>;
  const items = Array.isArray(typed.items) ? typed.items : [];
  const page = typed.page ?? (filters.page ?? 1);
  const perPage = typed.per_page ?? (filters.per_page ?? 12);
  const total = typed.total ?? items.length;
  const totalPages = typed.total_pages ?? Math.ceil(total / perPage);
  return {
    ...typed,
    items: items.map(normalizeRecipe),
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

export async function getRecipe(slug: string): Promise<Recipe> {
  try {
    const raw = await api.get<Recipe | { recipe: Recipe } | { data: Recipe }>(
      API_ENDPOINTS.RECIPE_BY_SLUG(slug),
      { skipAuth: true },
    );

    // Handle different response formats
    if (raw && typeof raw === 'object') {
      if ('recipe' in raw && raw.recipe) return normalizeRecipe(raw.recipe);
      if ('data' in raw && raw.data) return normalizeRecipe(raw.data);
    }

    return normalizeRecipe(raw as Recipe);
  } catch (error) {
    console.error(`[getRecipe] Failed to fetch recipe: ${slug}`, error);
    throw error;
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe> {
  return getRecipe(slug);
}

export async function getRecipesByAge(
  ageSlug: string,
  page = 1,
  perPage = 12,
): Promise<PaginatedResponse<Recipe>> {
  return getRecipes({ age_group: ageSlug, page, per_page: perPage });
}

export async function getRelatedRecipes(recipeId: number, limit = 4): Promise<Recipe[]> {
  const endpoint = `${API_ENDPOINTS.RECIPE_RELATED(recipeId)}?limit=${limit}`;
  const recipes = await api.get<Recipe[]>(endpoint, { skipAuth: true });
  return recipes.map(normalizeRecipe);
}

export async function getFeaturedRecipes(): Promise<Recipe[]> {
  const recipes = await api.get<Recipe[]>(API_ENDPOINTS.FEATURED_RECIPES, { skipAuth: true });
  return recipes.map(normalizeRecipe);
}

export async function rateRecipe(
  recipeId: number,
  rating: number,
): Promise<{ rating: number; rating_count: number }> {
  return api.post<{ rating: number; rating_count: number }>(
    API_ENDPOINTS.RECIPE_RATING(recipeId),
    { rating },
  );
}
