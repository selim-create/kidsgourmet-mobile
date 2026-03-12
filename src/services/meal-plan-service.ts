import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { MealPlan } from '../lib/types';

export async function getMealPlan(year: number, week: number): Promise<MealPlan> {
  return api.get<MealPlan>(API_ENDPOINTS.MEAL_PLAN_WEEK(year, week));
}

export async function getCurrentMealPlan(): Promise<MealPlan> {
  return api.get<MealPlan>(API_ENDPOINTS.MEAL_PLAN);
}

export async function addRecipeToMealPlan(data: {
  recipe_id: number;
  meal_type_id: number;
  date: string;
}): Promise<MealPlan> {
  return api.post<MealPlan>(API_ENDPOINTS.MEAL_PLAN, data);
}

export async function removeFromMealPlan(entryId: number): Promise<void> {
  return api.delete(`${API_ENDPOINTS.MEAL_PLAN}/${entryId}`);
}

export async function markMealComplete(entryId: number): Promise<void> {
  return api.patch(`${API_ENDPOINTS.MEAL_PLAN}/${entryId}/complete`);
}
