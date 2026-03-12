import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { GrowthData, GrowthRecord, PercentileResult } from '../lib/types';

export async function getGrowthData(childId: number): Promise<GrowthData> {
  return api.get<GrowthData>(API_ENDPOINTS.GROWTH_RECORD(childId));
}

export async function addGrowthRecord(
  record: Omit<GrowthRecord, 'id'>,
): Promise<GrowthRecord> {
  return api.post<GrowthRecord>(API_ENDPOINTS.GROWTH_ADD, record);
}

export async function getPercentileResult(
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
