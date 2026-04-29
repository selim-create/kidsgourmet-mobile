const TARIFTEN_API_URL = 'https://api.tariften.com/wp-json/tariften/v1';

export interface TariftenSuggestion {
  id: number;
  slug: string;
  title: string;
  image?: string;
  prep_time?: string;
  difficulty?: string;
}

const cache = new Map<string, TariftenSuggestion[]>();

export const tariftenService = {
  getByIngredient: async (ingredient: string, limit = 1): Promise<TariftenSuggestion[]> => {
    const key = `${ingredient.toLocaleLowerCase('tr-TR')}:${limit}`;
    if (cache.has(key)) return cache.get(key)!;
    try {
      const res = await fetch(
        `${TARIFTEN_API_URL}/recipes/by-ingredient?ingredient=${encodeURIComponent(ingredient)}&limit=${limit}`,
        { headers: { 'Content-Type': 'application/json' } },
      );
      if (!res.ok) return [];
      const data = await res.json();
      const recipes: TariftenSuggestion[] =
        data?.success && Array.isArray(data?.recipes) ? data.recipes : [];
      cache.set(key, recipes);
      return recipes;
    } catch {
      return [];
    }
  },
};
