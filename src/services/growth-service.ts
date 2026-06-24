import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type {
  GrowthChartData,
  GrowthChartType,
  GrowthData,
  GrowthRecord,
  PercentileResult,
} from '../lib/types';

export async function getGrowthData(childId: string): Promise<GrowthData | null> {
  try {
    return await api.get<GrowthData>(API_ENDPOINTS.GROWTH_RECORD(childId));
  } catch (err) {
    if (__DEV__) {
      console.info('[KG] getGrowthData: endpoint not available on backend', String(err));
    }
    return null;
  }
}

export async function addGrowthRecord(
  record: Omit<GrowthRecord, 'id'>,
): Promise<GrowthRecord> {
  try {
    const response = await api.post<{ record: GrowthRecord }>(API_ENDPOINTS.GROWTH_ADD, record);
    return response.record;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to add growth record: ${message}`);
  }
}

export async function updateGrowthRecord(
  id: string,
  data: Partial<Omit<GrowthRecord, 'id' | 'child_id'>>,
): Promise<GrowthRecord> {
  try {
    const response = await api.put<{ record: GrowthRecord }>(API_ENDPOINTS.GROWTH_UPDATE(id), data);
    return response.record;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to update growth record: ${message}`);
  }
}

export async function deleteGrowthRecord(id: string): Promise<void> {
  await api.delete(API_ENDPOINTS.GROWTH_DELETE(id));
}

export async function getPercentileResult(
  childId: string | number,
): Promise<PercentileResult | null> {
  try {
    return await api.get<PercentileResult>(
      `${API_ENDPOINTS.TOOL_PERCENTILE_RESULTS}?child_id=${childId}`,
    );
  } catch {
    return null;
  }
}

export async function getGrowthChartData(
  childId: string,
  type: GrowthChartType = 'weight_for_age',
): Promise<GrowthChartData | null> {
  try {
    return await api.get<GrowthChartData>(
      `${API_ENDPOINTS.GROWTH_CHART_DATA(childId)}&type=${type}`,
    );
  } catch {
    return null;
  }
}
