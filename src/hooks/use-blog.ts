import useSWR from 'swr';
import { getBlogPosts } from '../services/blog-service';
import type { BlogPost, PaginatedResponse } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';

export function useBlog(page = 1, perPage = 10, category?: string) {
  const key = `${API_ENDPOINTS.BLOG}?page=${page}&per_page=${perPage}${category ? `&category=${category}` : ''}`;

  const { data, error, isLoading } = useSWR<PaginatedResponse<BlogPost>>(
    key,
    () => getBlogPosts(page, perPage, category),
  );

  return {
    posts: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.total_pages ?? 0,
    isLoading,
    error,
  };
}
