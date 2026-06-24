import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { MealPlan, MealPlanDay, MealPlanEntry, MealType, Recipe } from '../lib/types';

/** Derives ISO week year/number from a YYYY-MM-DD date string. */
function getISOWeekFromDate(isoDate: string): { year: number; week: number } {
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week };
}

/**
 * Maps the kg-core backend response to the mobile MealPlan shape.
 *
 * kg-core returns `{ success: true, plan: { days: [{ date, day_name, slots: [...] }] } }`.
 * Mobile expects `{ days: [{ date, day_name, meals: [...] }] }`.
 * Differences handled:
 *   - Unwraps the `{ success, plan }` envelope.
 *   - Renames `slots` → `meals`.
 *   - Maps `slot_type`/`slot_label` → `meal_type: MealType`.
 *   - Maps recipe `image` → `featured_image`.
 *   - Derives `year`/`week` from `week_start`.
 */
export function normalizeMealPlan(raw: unknown): MealPlan | null {
  if (!raw || typeof raw !== 'object') return null;

  const wrapper = raw as Record<string, unknown>;
  // Unwrap { success: true, plan: {...} } envelope when present
  const planData: unknown = 'plan' in wrapper ? wrapper.plan : raw;

  if (!planData || typeof planData !== 'object') return null;

  const plan = planData as Record<string, unknown>;

  // Derive year/week from week_start; fall back to explicit year/week fields
  const weekStart = typeof plan.week_start === 'string' ? plan.week_start : undefined;
  const { year, week } = weekStart
    ? getISOWeekFromDate(weekStart)
    : {
        year: typeof plan.year === 'number' ? plan.year : new Date().getFullYear(),
        week: typeof plan.week === 'number' ? plan.week : 1,
      };

  const rawDays = Array.isArray(plan.days) ? plan.days : [];

  const days: MealPlanDay[] = rawDays.map((rawDay: unknown): MealPlanDay => {
    if (!rawDay || typeof rawDay !== 'object') {
      return { date: '', day_name: '', meals: [] };
    }
    const d = rawDay as Record<string, unknown>;
    const date = typeof d.date === 'string' ? d.date : '';
    const dayName = typeof d.day_name === 'string' ? d.day_name : '';

    // Old shape: day already has a `meals` array — pass through as-is (backward compat; structure already matches MealPlanEntry[])
    if (Array.isArray(d.meals)) {
      return { date, day_name: dayName, meals: d.meals as MealPlanEntry[] };
    }

    // New kg-core shape: day has `slots` array — map to meals
    const rawSlots = Array.isArray(d.slots) ? d.slots : [];
    const meals: MealPlanEntry[] = rawSlots
      .filter((slot: unknown): slot is Record<string, unknown> => {
        if (!slot || typeof slot !== 'object') return false;
        return (slot as Record<string, unknown>).status === 'filled';
      })
      .map((s: Record<string, unknown>): MealPlanEntry => {
        const rawRecipe =
          s.recipe && typeof s.recipe === 'object'
            ? (s.recipe as Record<string, unknown>)
            : null;

        const recipe: Recipe | undefined = rawRecipe
          ? {
              id: typeof rawRecipe.id === 'number' ? rawRecipe.id : 0,
              slug: typeof rawRecipe.slug === 'string' ? rawRecipe.slug : '',
              title: typeof rawRecipe.title === 'string' ? rawRecipe.title : '',
              featured_image:
                typeof rawRecipe.image === 'string'
                  ? rawRecipe.image
                  : typeof rawRecipe.featured_image === 'string'
                    ? rawRecipe.featured_image
                    : undefined,
              allergens: Array.isArray(rawRecipe.allergens)
                ? (rawRecipe.allergens as string[])
                : undefined,
            }
          : undefined;

        const mealType: MealType = {
          // kg-core doesn't expose a numeric meal-type ID in slot data; id:0 is safe
          // because HaftalikPlanScreen only uses mealType.name and mealType.slug for display.
          id: 0,
          name: typeof s.slot_label === 'string' ? s.slot_label : 'Öğün',
          slug: typeof s.slot_type === 'string' ? s.slot_type : '',
        };

        return { meal_type: mealType, recipe };
      });

    return { date, day_name: dayName, meals };
  });

  return {
    id: typeof plan.id === 'number' ? plan.id : undefined,
    year,
    week,
    days,
  };
}

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
    const raw = await api.get<unknown>(API_ENDPOINTS.MEAL_PLANS_ACTIVE(childId, start));
    return normalizeMealPlan(raw);
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
  const raw = await api.get<unknown>(API_ENDPOINTS.MEAL_PLAN_BY_ID(id));
  const plan = normalizeMealPlan(raw);
  if (!plan) throw new Error('Invalid meal plan response');
  return plan;
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
