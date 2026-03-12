import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { SearchResult, SearchFilters } from '../lib/types';

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
