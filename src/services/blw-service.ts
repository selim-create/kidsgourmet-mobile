import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { BLWTestResult, SolidFoodReadinessResult } from '../lib/types';

export async function getBLWTestResults(
  childId: number,
): Promise<BLWTestResult | null> {
  try {
    return await api.get<BLWTestResult>(
      `${API_ENDPOINTS.TOOL_BLW_RESULTS}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}

export async function submitBLWTest(data: {
  child_id: number;
  answers: Record<string, boolean>;
}): Promise<BLWTestResult> {
  return api.post<BLWTestResult>(API_ENDPOINTS.TOOL_BLW_TEST, data);
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

export async function submitSolidFoodCheck(data: {
  child_id: number;
  factors: Record<string, boolean>;
}): Promise<SolidFoodReadinessResult> {
  return api.post<SolidFoodReadinessResult>(API_ENDPOINTS.TOOL_SOLID_FOOD, data);
}
