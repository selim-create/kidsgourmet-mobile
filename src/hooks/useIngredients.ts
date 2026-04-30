import useSWR from 'swr';
import { getIngredients } from '../services/ingredient-service';
import type { ListIngredient } from '../lib/types';

export function useIngredients(filters?: { search?: string; age?: number }) {
  const search = filters?.search?.trim() ?? '';
  const age = filters?.age;

  // Auth-independent key — Beslenme Rehberi is publicly accessible
  const key = `ingredients?search=${search}&age=${age ?? ''}`;

  const { data, error, isLoading } = useSWR<ListIngredient[] | { items: ListIngredient[] }>(
    key,
    () => getIngredients({ search: search || undefined }),
  );

  // Defensive guard: handle both plain array and wrapped { items: [...] } responses
  const allItems: ListIngredient[] = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: ListIngredient[] })?.items)
      ? (data as { items: ListIngredient[] }).items
      : [];

  // Client-side age filter (server-side search is handled via SWR key/fetcher)
  const filtered = allItems.filter((item) => {
    const matchesAge =
      !age ||
      item.min_age_months === null ||
      item.min_age_months === undefined ||
      item.min_age_months <= age;
    return matchesAge;
  });

  return {
    ingredients: filtered,
    isLoading,
    error,
  };
}
