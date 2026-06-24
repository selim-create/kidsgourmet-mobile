import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  SearchResult,
  SearchFilters,
  SearchResponse,
  SearchParams,
} from '../lib/types';

/**
 * @deprecated Use searchService.search() instead — returns categorized results.
 */
export async function search(filters: SearchFilters): Promise<SearchResult> {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.age_group) params.set('age_group', filters.age_group);
  if (filters.meal_type) params.set('meal_type', filters.meal_type);
  if (filters.diet_type) params.set('diet_type', filters.diet_type);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.per_page) params.set('per_page', String(filters.per_page));

  return api.get<SearchResult>(
    `${API_ENDPOINTS.SEARCH}?${params.toString()}`,
  );
}

export const searchService = {
  /**
   * Search across all content types (web parity).
   * Returns categorized results: recipes, ingredients, posts, discussions.
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    const { q, type = 'all', age_group, per_page = 50 } = params;

    const queryParams = new URLSearchParams({
      q,
      type,
      per_page: per_page.toString(),
    });

    if (age_group) {
      queryParams.append('age_group', age_group);
    }

    try {
      return await api.get<SearchResponse>(
        `${API_ENDPOINTS.SEARCH}?${queryParams.toString()}`,
      );
    } catch (error) {
      console.error('Search API error:', error);
      return {
        success: false,
        query: q,
        type,
        results: [],
        categorized: { recipes: [], ingredients: [], posts: [], discussions: [] },
        counts: { total: 0, recipes: 0, ingredients: 0, posts: 0, discussions: 0 },
        total: 0,
      };
    }
  },
};
