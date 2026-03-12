import useSWR from 'swr';
import { getFoodIntroductionItems } from '../services/food-introduction-service';
import type { FoodIntroductionItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useIngredients(filters?: { search?: string; age?: number }) {
  const search = filters?.search?.trim() ?? '';
  const { activeChild } = useActiveChild();

  // Only fetch when an active child is known; null key disables the SWR request
  const key = activeChild
    ? `${API_ENDPOINTS.FOOD_INTRODUCTION_SUGGESTED}?child_id=${activeChild.id}`
    : null;

  const { data, error, isLoading } = useSWR<FoodIntroductionItem[]>(
    key,
    () => getFoodIntroductionItems(activeChild!.id),
  );

  // Client-side filtering for search and age
  const allItems = data ?? [];
  const filtered = allItems.filter((item) => {
    const matchesSearch =
      !search || item.food_name.toLowerCase().includes(search.toLowerCase());
    const matchesAge =
      !filters?.age ||
      !item.recommended_age_months ||
      item.recommended_age_months <= filters.age;
    return matchesSearch && matchesAge;
  });

  return {
    ingredients: filtered,
    isLoading,
    error,
  };
}
