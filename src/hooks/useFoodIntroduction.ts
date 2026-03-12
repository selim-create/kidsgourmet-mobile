import useSWR from 'swr';
import { getFoodIntroductionItems } from '../services/food-introduction-service';
import type { FoodIntroductionItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useActiveChild } from '../contexts/ActiveChildContext';
import { calculateAgeInMonths } from '../utils/ageCalculator';

export function useFoodIntroduction(childId?: string) {
  const { activeChild } = useActiveChild();

  const ageMonths = activeChild?.birth_date
    ? calculateAgeInMonths(activeChild.birth_date)
    : undefined;

  const key = `${API_ENDPOINTS.FOOD_INTRODUCTION}${ageMonths ? `?age_months=${ageMonths}` : ''}`;

  const { data, error, isLoading } = useSWR<FoodIntroductionItem[]>(
    key,
    () => getFoodIntroductionItems(ageMonths),
  );

  return {
    items: data ?? [],
    ageMonths,
    isLoading,
    error,
  };
}
