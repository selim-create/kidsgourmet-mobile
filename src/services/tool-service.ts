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
  weight_kg?: number;
  feeding_type?: 'breast' | 'formula' | 'mixed' | 'solid';
}): Promise<WaterNeedResult> {
  const query = new URLSearchParams();
  query.append('age_months', String(params.age_months));
  if (params.weight_kg !== undefined) {
    query.append('weight_kg', String(params.weight_kg));
  }
  if (params.feeding_type) {
    query.append('feeding_type', params.feeding_type);
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
  childId?: number,
): Promise<SolidFoodReadinessResult> {
  return api.post<SolidFoodReadinessResult>(API_ENDPOINTS.SOLID_FOOD_READINESS_SUBMIT, {
    answers,
    child_id: childId,
  });
}

export async function getSolidFoodReadiness(
  childId: number,
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

export async function getFoodTrials(): Promise<FoodTrial[]> {
  return api.get<FoodTrial[]>(API_ENDPOINTS.FOOD_TRIALS);
}

export async function createFoodTrial(input: FoodTrialInput): Promise<FoodTrial> {
  return api.post<FoodTrial>(API_ENDPOINTS.FOOD_TRIALS, input);
}

export async function updateFoodTrial(
  id: number,
  input: Partial<FoodTrialInput>,
): Promise<FoodTrial> {
  return api.put<FoodTrial>(API_ENDPOINTS.FOOD_TRIAL(id), input);
}

export async function deleteFoodTrial(id: number): Promise<void> {
  return api.delete<void>(API_ENDPOINTS.FOOD_TRIAL(id));
}

export async function getFoodTrialSummary(): Promise<FoodTrialSummary> {
  return api.get<FoodTrialSummary>(API_ENDPOINTS.FOOD_TRIAL_SUMMARY);
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

export async function analyzeAirQuality(params: {
  lat: number;
  lon: number;
}): Promise<AirQualityResult> {
  return api.post<AirQualityResult>(API_ENDPOINTS.AIR_QUALITY_ANALYZE, params, {
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
