import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  Tool,
  BLWTestConfig,
  BLWTestAnswer,
  BLWTestResult,
  PercentileMeasurement,
  PercentileResult,
  WaterNeedResult,
  SolidFoodReadinessConfig,
  SolidFoodReadinessResult,
  AllergenPlannerConfig,
  AllergenPlannerInput,
  AllergenTrialPlan,
  FoodTrial,
  FoodTrialInput,
  FoodTrialSummary,
  BathPlannerConfig,
  BathPlannerInput,
  BathPlannerResult,
  HygieneInput,
  HygieneCalculatorResult,
  DiaperInput,
  DiaperCalculatorResult,
  RashRiskInput,
  RashRiskResult,
  AirQualityResult,
  AirQualityInput,
  StainGuide,
  StainSearchResponse,
} from '../lib/types';

// ─── Tools List ───────────────────────────────────────────────────────────────

export async function getTools(): Promise<Tool[]> {
  return api.get<Tool[]>(API_ENDPOINTS.TOOLS, { skipAuth: true });
}

export async function getToolBySlug(slug: string): Promise<Tool> {
  return api.get<Tool>(API_ENDPOINTS.TOOL_BY_SLUG(slug), { skipAuth: true });
}

// ─── BLW Test ─────────────────────────────────────────────────────────────────

export async function getBLWTestConfig(): Promise<BLWTestConfig> {
  return api.get<BLWTestConfig>(API_ENDPOINTS.BLW_TEST_CONFIG, { skipAuth: true });
}

export async function submitBLWTest(
  answers: BLWTestAnswer[],
  childId?: number,
): Promise<BLWTestResult> {
  return api.post<BLWTestResult>(API_ENDPOINTS.BLW_TEST_SUBMIT, {
    answers,
    child_id: childId,
  });
}

export async function getBLWTestResults(childId: number): Promise<BLWTestResult | null> {
  try {
    return await api.get<BLWTestResult>(
      `${API_ENDPOINTS.TOOL_BLW_RESULTS}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}

// ─── Percentile ───────────────────────────────────────────────────────────────

export async function calculatePercentile(
  measurement: PercentileMeasurement,
): Promise<PercentileResult> {
  return api.post<PercentileResult>(API_ENDPOINTS.PERCENTILE_CALCULATE, measurement, {
    skipAuth: true,
  });
}

export async function savePercentileResult(
  result: PercentileResult,
  childId?: number,
): Promise<PercentileResult> {
  return api.post<PercentileResult>(API_ENDPOINTS.PERCENTILE_SAVE, {
    ...result,
    child_id: childId ?? result.child_id,
  });
}

export async function savePercentileWithRegistration(data: {
  measurement: PercentileMeasurement;
  registration: {
    email: string;
    password: string;
    name: string;
    child_name: string;
    child_birth_date: string;
    consents: {
      terms_accepted: boolean;
      sensitive_data_consent: boolean;
      guardian_declaration: boolean;
    };
  };
}): Promise<{ result: PercentileResult; token: string }> {
  return api.post<{ result: PercentileResult; token: string }>(
    `${API_ENDPOINTS.PERCENTILE_SAVE}?register=true`,
    data,
    { skipAuth: true },
  );
}

export async function getUserPercentileResults(): Promise<PercentileResult[]> {
  try {
    return await api.get<PercentileResult[]>(API_ENDPOINTS.TOOL_PERCENTILE_RESULTS);
  } catch {
    return [];
  }
}

/**
 * @deprecated Use `savePercentileResult(result, childId?)` instead.
 * This function accepts a `PercentileMeasurement` but `savePercentileResult`
 * accepts the full `PercentileResult` returned by `calculatePercentile`.
 * Migration: replace `savePercentile(measurement)` with
 * `calculatePercentile(measurement).then(r => savePercentileResult(r))`.
 * Will be removed in a future release.
 */
export async function savePercentile(
  measurement: PercentileMeasurement,
): Promise<PercentileResult> {
  return api.post<PercentileResult>(API_ENDPOINTS.PERCENTILE_SAVE, measurement);
}

export async function getPercentileResults(
  childId: number,
): Promise<PercentileResult | null> {
  try {
    return await api.get<PercentileResult>(
      `${API_ENDPOINTS.TOOL_PERCENTILE_RESULTS}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}

// ─── Water Calculator ─────────────────────────────────────────────────────────

export async function calculateWaterNeed(params: {
  age_months: number;
  weight_kg: number;
  weather?: 'hot' | 'normal' | 'cold';
  is_breastfed?: boolean;
}): Promise<WaterNeedResult> {
  const query = new URLSearchParams();
  query.append('age_months', String(params.age_months));
  query.append('weight_kg', String(params.weight_kg));
  if (params.weather) {
    query.append('weather', params.weather);
  }
  if (params.is_breastfed !== undefined) {
    query.append('is_breastfed', String(params.is_breastfed));
  }
  return api.get<WaterNeedResult>(
    `${API_ENDPOINTS.WATER_CALCULATOR}?${query.toString()}`,
    { skipAuth: true },
  );
}

// ─── Solid Food Readiness ─────────────────────────────────────────────────────

export async function getSolidFoodReadinessConfig(): Promise<SolidFoodReadinessConfig> {
  return api.get<SolidFoodReadinessConfig>(API_ENDPOINTS.SOLID_FOOD_READINESS_CONFIG, {
    skipAuth: true,
  });
}

export async function submitSolidFoodReadiness(
  answers: Record<string, boolean>,
  childId?: string | number,
): Promise<SolidFoodReadinessResult> {
  return api.post<SolidFoodReadinessResult>(API_ENDPOINTS.SOLID_FOOD_READINESS_SUBMIT, {
    answers,
    child_id: childId,
  });
}

export async function getSolidFoodReadiness(
  childId: string | number,
): Promise<SolidFoodReadinessResult | null> {
  try {
    return await api.get<SolidFoodReadinessResult>(
      `${API_ENDPOINTS.TOOL_SOLID_FOOD_RESULTS}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}

// ─── Allergen Planner ─────────────────────────────────────────────────────────

export async function getAllergenPlannerConfig(): Promise<AllergenPlannerConfig> {
  return api.get<AllergenPlannerConfig>(API_ENDPOINTS.ALLERGEN_PLANNER_CONFIG, {
    skipAuth: true,
  });
}

export async function generateAllergenPlan(
  input: AllergenPlannerInput,
): Promise<AllergenTrialPlan> {
  return api.post<AllergenTrialPlan>(API_ENDPOINTS.ALLERGEN_PLANNER_GENERATE, input);
}

// ─── Food Trials (auth required) ─────────────────────────────────────────────

function normalizeFoodTrial(item: unknown): FoodTrial | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const id =
    typeof record.id === 'number'
      ? record.id
      : typeof record.id === 'string'
        ? Number(record.id)
        : Number.NaN;
  if (Number.isNaN(id)) return null;

  const result = record.result;
  if (
    result !== 'success' &&
    result !== 'mild_reaction' &&
    result !== 'reaction' &&
    result !== 'severe_reaction'
  ) {
    return null;
  }
  const ingredientId =
    typeof record.ingredient_id === 'number'
      ? record.ingredient_id
      : typeof record.ingredient_id === 'string'
        ? Number(record.ingredient_id)
        : undefined;
  const childId =
    record.child_id !== undefined && record.child_id !== null
      ? String(record.child_id).trim()
      : '';
  const trialDate = typeof record.trial_date === 'string' ? record.trial_date.trim() : '';
  if (!childId || !trialDate) return null;

  return {
    ...(record as Partial<FoodTrial>),
    id,
    child_id: childId,
    ingredient_id:
      ingredientId !== undefined && !Number.isNaN(ingredientId)
        ? ingredientId
        : undefined,
    ingredient_name:
      typeof record.ingredient_name === 'string' ? record.ingredient_name : undefined,
    trial_date: trialDate,
    result,
    reaction: typeof record.reaction === 'string' ? record.reaction : undefined,
    reaction_notes:
      typeof record.reaction_notes === 'string' ? record.reaction_notes : undefined,
    amount: typeof record.amount === 'string' ? record.amount : undefined,
    form: typeof record.form === 'string' ? record.form : undefined,
    retry_after:
      typeof record.retry_after === 'string' ? record.retry_after : undefined,
    is_new: typeof record.is_new === 'boolean' ? record.is_new : undefined,
    created_at:
      typeof record.created_at === 'string' ? record.created_at : undefined,
    updated_at:
      typeof record.updated_at === 'string' ? record.updated_at : undefined,
  };
}

export async function getFoodTrials(childId?: string): Promise<FoodTrial[]> {
  const endpoint = childId
    ? `${API_ENDPOINTS.FOOD_TRIALS}?child_id=${encodeURIComponent(childId)}`
    : API_ENDPOINTS.FOOD_TRIALS;
  try {
    const response = await api.get<unknown>(endpoint);
    const rawTrials =
      Array.isArray(response)
        ? response
        : response && typeof response === 'object' && Array.isArray((response as { trials?: unknown }).trials)
          ? (response as { trials: unknown[] }).trials
          : [];

    return rawTrials
      .map(normalizeFoodTrial)
      .filter((trial): trial is FoodTrial => trial !== null);
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[ToolService] getFoodTrials error:',
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
}

export async function createFoodTrial(input: FoodTrialInput): Promise<FoodTrial> {
  return api.post<FoodTrial>(API_ENDPOINTS.FOOD_TRIALS, {
    child_id: String(input.child_id),
    ingredient_id: input.ingredient_id,
    ingredient_name: input.ingredient_name,
    trial_date: input.trial_date,
    result: input.result,
    reaction_notes: input.reaction_notes,
    amount: input.amount,
    form: input.form,
  });
}

export async function updateFoodTrial(
  id: number,
  input: Partial<FoodTrialInput>,
): Promise<FoodTrial> {
  return api.put<FoodTrial>(API_ENDPOINTS.FOOD_TRIAL(id), {
    ...(input.child_id !== undefined ? { child_id: String(input.child_id) } : {}),
    ...(input.ingredient_id !== undefined ? { ingredient_id: input.ingredient_id } : {}),
    ...(input.ingredient_name !== undefined ? { ingredient_name: input.ingredient_name } : {}),
    ...(input.trial_date !== undefined ? { trial_date: input.trial_date } : {}),
    ...(input.result !== undefined ? { result: input.result } : {}),
    ...(input.reaction_notes !== undefined ? { reaction_notes: input.reaction_notes } : {}),
    ...(input.amount !== undefined ? { amount: input.amount } : {}),
    ...(input.form !== undefined ? { form: input.form } : {}),
  });
}

export async function deleteFoodTrial(id: number): Promise<void> {
  return api.delete<void>(API_ENDPOINTS.FOOD_TRIAL(id));
}

export async function getFoodTrialSummary(childId: string): Promise<FoodTrialSummary> {
  try {
    const response = await api.get<unknown>(
      `${API_ENDPOINTS.FOOD_TRIAL_STATS}?child_id=${encodeURIComponent(childId)}`,
    );
    const payload =
      response && typeof response === 'object' && (response as { data?: unknown }).data
        ? (response as { data: unknown }).data
        : response;

    const summary =
      payload && typeof payload === 'object'
        ? (payload as Partial<FoodTrialSummary>)
        : {};

    return {
      total_trials: Number(summary.total_trials ?? 0),
      success: Number(summary.success ?? 0),
      mild_reaction: Number(summary.mild_reaction ?? 0),
      reaction: Number(summary.reaction ?? 0),
      severe_reaction: Number(summary.severe_reaction ?? 0),
      recent_trials: Array.isArray(summary.recent_trials)
        ? summary.recent_trials
            .map(normalizeFoodTrial)
            .filter((trial): trial is FoodTrial => trial !== null)
        : [],
    };
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[ToolService] getFoodTrialSummary error:',
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
}

// ─── Bath Planner ─────────────────────────────────────────────────────────────

export async function getBathPlannerConfig(): Promise<BathPlannerConfig> {
  return api.get<BathPlannerConfig>(API_ENDPOINTS.BATH_PLANNER_CONFIG, { skipAuth: true });
}

export async function generateBathPlan(input: BathPlannerInput): Promise<BathPlannerResult> {
  return api.post<BathPlannerResult>(API_ENDPOINTS.BATH_PLANNER_GENERATE, input, {
    skipAuth: true,
  });
}

// ─── Hygiene Calculator ───────────────────────────────────────────────────────

export async function calculateHygiene(input: HygieneInput): Promise<HygieneCalculatorResult> {
  return api.post<HygieneCalculatorResult>(API_ENDPOINTS.HYGIENE_CALCULATOR, input, {
    skipAuth: true,
  });
}

// ─── Diaper Calculator ────────────────────────────────────────────────────────

export async function calculateDiapers(input: DiaperInput): Promise<DiaperCalculatorResult> {
  return api.post<DiaperCalculatorResult>(API_ENDPOINTS.DIAPER_CALCULATOR, input, {
    skipAuth: true,
  });
}

export async function calculateRashRisk(input: RashRiskInput): Promise<RashRiskResult> {
  return api.post<RashRiskResult>(API_ENDPOINTS.DIAPER_RASH_RISK, input, { skipAuth: true });
}

// ─── Air Quality ──────────────────────────────────────────────────────────────

export async function analyzeAirQuality(input: AirQualityInput): Promise<AirQualityResult> {
  return api.post<AirQualityResult>(API_ENDPOINTS.AIR_QUALITY_ANALYZE, input, {
    skipAuth: true,
  });
}

// ─── Stain Encyclopedia ───────────────────────────────────────────────────────

export async function searchStains(query: string): Promise<StainGuide[]> {
  const response = await api.get<StainSearchResponse>(
    `${API_ENDPOINTS.STAIN_ENCYCLOPEDIA_SEARCH}?q=${encodeURIComponent(query)}`,
    { skipAuth: true },
  );
  return response.stains;
}

export async function getStainBySlug(slug: string): Promise<StainGuide> {
  return api.get<StainGuide>(API_ENDPOINTS.STAIN_ENCYCLOPEDIA_BY_SLUG(slug), {
    skipAuth: true,
  });
}
