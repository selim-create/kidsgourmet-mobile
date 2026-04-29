import useSWR from 'swr';
import { getBlogCategories } from '../services/blog-service';
import type { BlogCategory } from '../lib/types';

export function useBlogCategories() {
  const { data, error, isLoading } = useSWR<BlogCategory[]>(
    '/wp/v2/categories?per_page=100&hide_empty=true',
    () => getBlogCategories(),
  );

  return {
    categories: data ?? [],
    isLoading,
    error,
  };
}
