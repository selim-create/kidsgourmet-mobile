import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { FoodIntroductionItem } from '../lib/types';

export async function getFoodIntroductionItems(
  childId?: number,
): Promise<FoodIntroductionItem[]> {
  const params = childId ? `?child_id=${childId}` : '';
  return api.get<FoodIntroductionItem[]>(
    `${API_ENDPOINTS.FOOD_INTRODUCTION_SUGGESTED}${params}`,
  );
}

export async function getNextFoodSuggestion(
  childId: number,
): Promise<FoodIntroductionItem | null> {
  try {
    return await api.get<FoodIntroductionItem>(
      `${API_ENDPOINTS.FOOD_INTRODUCTION_NEXT}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}
