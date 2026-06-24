import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { MealPlan } from '../lib/types';

/** Returns ISO date (YYYY-MM-DD) of the Monday of the week containing the given date (defaults to today). */
function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // move to Monday
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function getWeekStartFromISOWeek(year: number, week: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const mondayOfWeek1 = new Date(jan4);
  mondayOfWeek1.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const monday = new Date(mondayOfWeek1);
  monday.setUTCDate(mondayOfWeek1.getUTCDate() + (week - 1) * 7);
  return monday.toISOString().split('T')[0];
}

export async function getActiveMealPlan(
  childId: string,
  weekStart?: string,
): Promise<MealPlan | null> {
  const start = weekStart ?? getWeekStart();
  try {
    return await api.get<MealPlan>(API_ENDPOINTS.MEAL_PLANS_ACTIVE(childId, start));
  } catch {
    return null;
  }
}

export async function getMealPlan(
  childId: string,
  year: number,
  week: number,
): Promise<MealPlan | null> {
  const weekStart = getWeekStartFromISOWeek(year, week);
  return getActiveMealPlan(childId, weekStart);
}

/** @deprecated Use getActiveMealPlan(childId, weekStart) — current week. Kept for backward compat. */
export async function getCurrentMealPlan(childId?: string): Promise<MealPlan | null> {
  if (!childId) return null;
  return getActiveMealPlan(childId);
}

export async function generateMealPlan(options: {
  child_id: string;
  week_start?: string;
}): Promise<MealPlan> {
  return api.post<MealPlan>(API_ENDPOINTS.MEAL_PLANS_GENERATE, {
    child_id: options.child_id,
    week_start: options.week_start ?? getWeekStart(),
  });
}

export async function getMealPlanById(id: string): Promise<MealPlan> {
  return api.get<MealPlan>(API_ENDPOINTS.MEAL_PLAN_BY_ID(id));
}

export async function refreshMealPlanSlot(planId: string, slotId: string): Promise<MealPlan> {
  return api.post<MealPlan>(API_ENDPOINTS.MEAL_PLAN_REFRESH_SLOT(planId, slotId), {});
}

export async function skipMealPlanSlot(planId: string, slotId: string): Promise<MealPlan> {
  return api.post<MealPlan>(API_ENDPOINTS.MEAL_PLAN_SKIP_SLOT(planId, slotId), {});
}

export async function assignMealPlanSlot(
  planId: string,
  slotId: string,
  payload: { recipe_id: number },
): Promise<MealPlan> {
  return api.post<MealPlan>(API_ENDPOINTS.MEAL_PLAN_ASSIGN_SLOT(planId, slotId), payload);
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
