import useSWR from 'swr';
import { getFoodIntroductionItems } from '../services/food-introduction-service';
import type { FoodIntroductionItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';

export function useIngredients(filters?: { search?: string; age?: number }) {
  const search = filters?.search?.trim() ?? '';

  const key = `${API_ENDPOINTS.FOOD_INTRODUCTION}`;

  const { data, error, isLoading } = useSWR<FoodIntroductionItem[]>(
    key,
    () => getFoodIntroductionItems(),
  );

  // Client-side filtering
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
