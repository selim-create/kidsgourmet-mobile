import useSWR from 'swr';
import { getFoodIntroductionItems } from '../services/food-introduction-service';
import type { FoodIntroductionItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useFoodIntroduction() {
  const { activeChild } = useActiveChild();

  // Only fetch when an active child is known; null key disables the SWR request
  const key = activeChild
    ? `${API_ENDPOINTS.FOOD_INTRODUCTION_SUGGESTED}?child_id=${activeChild.id}`
    : null;

  const { data, error, isLoading } = useSWR<FoodIntroductionItem[]>(
    key,
    () => getFoodIntroductionItems(activeChild!.id),
  );

  return {
    items: data ?? [],
    isLoading,
    error,
  };
}
