import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Author, PaginatedResponse, Recipe } from '../lib/types';
import { getRecipes } from './recipe-service';

const MAX_AUTHOR_FALLBACK_PAGES = 10;

interface WPUser {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  avatar_urls?: Record<string, string>;
  meta?: { title?: string; is_expert?: boolean };
}

function normalizeAuthor(raw: WPUser): Author {
  const avatarUrls = raw.avatar_urls ?? {};
  const sizes = Object.keys(avatarUrls).sort((a, b) => Number(b) - Number(a));
  const avatar_url = sizes.length > 0 ? avatarUrls[sizes[0]] : undefined;
  return {
    id: raw.id,
    name: raw.name ?? '',
    slug: raw.slug,
    avatar_url,
    bio: raw.description,
    is_expert: raw.meta?.is_expert ?? false,
  };
}

export async function getAuthor(id: number): Promise<Author> {
  const raw = await api.get<WPUser>(API_ENDPOINTS.AUTHOR(id), { skipAuth: true });
  return normalizeAuthor(raw);
}

export async function getAuthorRecipes(
  authorId: number,
  page = 1,
  perPage = 12,
): Promise<PaginatedResponse<Recipe>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  const raw = await api.get<PaginatedResponse<Recipe>>(
    `${API_ENDPOINTS.AUTHOR_RECIPES(authorId)}&${params.toString()}`,
    { skipAuth: true },
  );
  const items = Array.isArray(raw.items) ? raw.items : [];
  if (items.length === 0) {
    const fallbackItems: Recipe[] = [];
    let currentPage = 1;
    let hasNext = true;

    while (
      hasNext &&
      fallbackItems.length < perPage * page &&
      currentPage <= MAX_AUTHOR_FALLBACK_PAGES
    ) {
      const response = await getRecipes({ page: currentPage, per_page: 100 });
      const matches = (response.items ?? []).filter((recipe) => recipe.author?.id === authorId);
      fallbackItems.push(...matches);
      hasNext = response.has_next ?? currentPage < (response.total_pages ?? currentPage);
      currentPage += 1;
    }

    const start = (page - 1) * perPage;
    const pagedItems = fallbackItems.slice(start, start + perPage);
    const totalFallback = fallbackItems.length;
    const fallbackTotalPages = Math.max(1, Math.ceil(totalFallback / perPage));

    return {
      items: pagedItems,
      page,
      per_page: perPage,
      total: totalFallback,
      total_pages: fallbackTotalPages,
      has_next: page < fallbackTotalPages,
      has_prev: page > 1,
    };
  }
  const total = raw.total ?? items.length;
  const totalPages = raw.total_pages ?? Math.ceil(total / perPage);
  return {
    ...raw,
    items,
    page,
    per_page: perPage,
    total,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}
