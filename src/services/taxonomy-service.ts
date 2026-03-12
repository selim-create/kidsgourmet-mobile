import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { AgeGroup, MealType, DietType } from '../lib/types';

export async function getAgeGroups(): Promise<AgeGroup[]> {
  return api.get<AgeGroup[]>(`${API_ENDPOINTS.AGE_GROUPS}?per_page=100`, { skipAuth: true });
}

export async function getMealTypes(): Promise<MealType[]> {
  return api.get<MealType[]>(`${API_ENDPOINTS.MEAL_TYPES}?per_page=100`, { skipAuth: true });
}

export async function getDietTypes(): Promise<DietType[]> {
  return api.get<DietType[]>(`${API_ENDPOINTS.DIET_TYPES}?per_page=100`, { skipAuth: true });
}
