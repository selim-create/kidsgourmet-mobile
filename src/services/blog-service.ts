import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { BlogPost, PaginatedResponse } from '../lib/types';

export async function getBlogPosts(
  page = 1,
  perPage = 10,
  category?: string,
): Promise<PaginatedResponse<BlogPost>> {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (category) params.set('category', category);

  return api.get<PaginatedResponse<BlogPost>>(
    `${API_ENDPOINTS.BLOG}?${params.toString()}`,
  );
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  return api.get<BlogPost>(API_ENDPOINTS.BLOG_POST(slug));
}
