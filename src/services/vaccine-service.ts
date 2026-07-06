import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

function normalizeVaccine(item: unknown): Vaccine | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const rawId = record.id ?? record.vaccine_id;
  if (rawId === undefined || rawId === null) return null;
  const id = Number(rawId);
  if (Number.isNaN(id)) return null;
  const name =
    typeof record.name === 'string'
      ? record.name
      : typeof record.vaccine_name === 'string'
        ? record.vaccine_name
        : null;
  if (!name) return null;

  return {
    ...(record as Partial<Vaccine>),
    id,
    name,
    vaccine_id:
      record.vaccine_id !== undefined && record.vaccine_id !== null
        ? Number(record.vaccine_id)
        : undefined,
    administered_at:
      typeof record.administered_at === 'string'
        ? record.administered_at
        : typeof record.date_administered === 'string'
          ? record.date_administered
          : undefined,
  };
}

function extractVaccineList(payload: unknown): Vaccine[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeVaccine).filter((item): item is Vaccine => item !== null);
  }
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const nestedCandidates = [record.data, record.items, record.vaccines];

  for (const candidate of nestedCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map(normalizeVaccine)
        .filter((item): item is Vaccine => item !== null);
    }
    if (candidate && typeof candidate === 'object') {
      const nestedRecord = candidate as Record<string, unknown>;
      const deepArray = nestedRecord.data ?? nestedRecord.items ?? nestedRecord.vaccines;
      if (Array.isArray(deepArray)) {
        return deepArray
          .map(normalizeVaccine)
          .filter((item): item is Vaccine => item !== null);
      }
    }
  }

  return [];
}

export async function getVaccines(): Promise<Vaccine[]> {
  const data = await api.get<unknown>(
    API_ENDPOINTS.VACCINES_MASTER,
    { skipAuth: true },
  );
  return extractVaccineList(data);
}

export async function getVaccinesByChild(childId: string): Promise<Vaccine[]> {
  const data = await api.get<unknown>(API_ENDPOINTS.VACCINES_BY_CHILD(childId));
  return extractVaccineList(data);
}

export async function markVaccineDone(data: {
  vaccine_id: number;
  child_id: string;
  date_administered?: string;
}): Promise<void> {
  return api.post(API_ENDPOINTS.VACCINES_MARK_DONE, data);
}
