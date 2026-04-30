import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Ingredient, IngredientDetail, IngredientGuideItem, IngredientGuideResponse } from '../lib/types';

// ─── Transform helpers (mirrors web's transformIngredient) ────────────────────

function transformIngredient(raw: any): IngredientGuideItem {
  const name = typeof raw.name === 'object' ? raw.name?.rendered ?? '' : raw.name ?? '';
  const description =
    typeof raw.description === 'object'
      ? raw.description?.rendered ?? ''
      : raw.description ?? '';
  return {
    id: raw.id ?? 0,
    slug: raw.slug ?? '',
    name,
    description,
    image: raw.image ?? raw.featured_image ?? raw.thumbnail ?? undefined,
    category: raw.category ?? undefined,
    start_age: raw.start_age ?? undefined,
    benefits: raw.benefits ?? undefined,
    allergy_risk: raw.allergy_risk ?? undefined,
    season: raw.season ?? undefined,
    storage_tips: raw.storage_tips ?? undefined,
    prep_methods: raw.prep_methods ?? undefined,
    prep_by_age: raw.prep_by_age ?? undefined,
    selection_tips: raw.selection_tips ?? undefined,
    pro_tips: raw.pro_tips ?? undefined,
    pairings: raw.pairings ?? undefined,
    nutrition: raw.nutrition ?? undefined,
    related_recipes: raw.related_recipes ?? undefined,
    faq: raw.faq ?? undefined,
    allergen_info: raw.allergen_info ?? undefined,
    allergens: raw.allergens ?? undefined,
    nutrition_per_100g: raw.nutrition_per_100g ?? undefined,
    prep_methods_list: raw.prep_methods_list ?? undefined,
    image_credit: raw.image_credit ?? undefined,
    seo: raw.seo ?? undefined,
  };
}

// ─── New ingredientService object (web parity) ────────────────────────────────

export const ingredientService = {
  /** Fetch paginated/filtered ingredient list. */
  async getAll(filters?: {
    page?: number;
    perPage?: number;
    category?: string;
    startAge?: string;
    allergyRisk?: string;
    season?: string;
  }): Promise<IngredientGuideItem[] | IngredientGuideResponse> {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.perPage) params.set('per_page', String(filters.perPage));
    if (filters?.category) params.set('category', filters.category);
    if (filters?.startAge) params.set('start_age', filters.startAge);
    if (filters?.allergyRisk) params.set('allergy_risk', filters.allergyRisk);
    if (filters?.season) params.set('season', filters.season);
    const query = params.toString();
    const url = query
      ? `${API_ENDPOINTS.INGREDIENTS}?${query}`
      : API_ENDPOINTS.INGREDIENTS;
    const raw = await api.get<any>(url, { skipAuth: true });

    if (Array.isArray(raw)) {
      return raw.map(transformIngredient);
    }
    if (raw && Array.isArray(raw.ingredients)) {
      return {
        ingredients: raw.ingredients.map(transformIngredient),
        total: raw.total ?? raw.ingredients.length,
        pages: raw.pages ?? 1,
      };
    }
    return [];
  },

  /** Fetch a single ingredient by slug. */
  async getBySlug(slug: string): Promise<IngredientGuideItem | null> {
    try {
      const raw = await api.get<any>(API_ENDPOINTS.INGREDIENT_BY_SLUG(slug), {
        skipAuth: true,
      });
      return raw ? transformIngredient(raw) : null;
    } catch {
      return null;
    }
  },

  /** Search ingredients. Falls back to client-side filter on error. */
  async search(query: string): Promise<IngredientGuideItem[]> {
    try {
      const raw = await api.get<any>(
        `${API_ENDPOINTS.INGREDIENT_SEARCH}?q=${encodeURIComponent(query)}`,
        { skipAuth: true },
      );
      const items: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.ingredients)
          ? raw.ingredients
          : [];
      return items.map(transformIngredient);
    } catch {
      // Fallback: fetch all and filter client-side
      try {
        const all = await ingredientService.getAll({ perPage: 200 });
        const list: IngredientGuideItem[] = Array.isArray(all)
          ? all
          : (all as IngredientGuideResponse).ingredients;
        const q = query.toLowerCase();
        return list.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.category?.toLowerCase().includes(q) ?? false),
        );
      } catch {
        return [];
      }
    }
  },

  /** Get unique category strings from all ingredients. */
  async getCategories(): Promise<string[]> {
    try {
      const all = await ingredientService.getAll({ perPage: 200 });
      const list: IngredientGuideItem[] = Array.isArray(all)
        ? all
        : (all as IngredientGuideResponse).ingredients;
      const unique = Array.from(
        new Set(list.map((i) => i.category).filter(Boolean) as string[]),
      );
      return unique.sort();
    } catch {
      return [];
    }
  },
};

// ─── Legacy exports (backward-compatible) ─────────────────────────────────────
// These functions are kept for any existing callers. They delegate to the new
// ingredientService and cast the result — the shapes are structurally similar
// enough for existing list/search use-cases, but callers should migrate to
// `ingredientService` directly for full type safety.

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  const results = await ingredientService.search(query);
  // IngredientGuideItem is structurally compatible with Ingredient for name/id fields
  return results as unknown as Ingredient[];
}

export async function getIngredients(filters?: { search?: string }): Promise<Ingredient[]> {
  if (filters?.search) {
    const results = await ingredientService.search(filters.search);
    return results as unknown as Ingredient[];
  }
  const results = await ingredientService.getAll();
  const list = Array.isArray(results) ? results : results.ingredients;
  return list as unknown as Ingredient[];
}

export async function getIngredientBySlug(slug: string): Promise<IngredientDetail> {
  const result = await ingredientService.getBySlug(slug);
  if (!result) throw new Error(`Ingredient not found: ${slug}`);
  return result as unknown as IngredientDetail;
}

