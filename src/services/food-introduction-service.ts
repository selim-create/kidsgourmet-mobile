import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { FoodIntroductionItem } from '../lib/types';

export async function getFoodIntroductionItems(
  ageMonths?: number,
): Promise<FoodIntroductionItem[]> {
  const params = ageMonths ? `?age_months=${ageMonths}` : '';
  return api.get<FoodIntroductionItem[]>(
    `${API_ENDPOINTS.FOOD_INTRODUCTION_SUGGESTED}${params}`,
  );
}
