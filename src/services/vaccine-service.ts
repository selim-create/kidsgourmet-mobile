import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

type VaccineEnvelope = {
  vaccines: Vaccine[];
  birthDate?: string;
};

function toNumberIfPossible(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const num = Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return undefined;
}

function normalizeVaccine(item: unknown): Vaccine | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  const nested =
    record.vaccine && typeof record.vaccine === 'object'
      ? (record.vaccine as Record<string, unknown>)
      : undefined;

  const rawId =
    record.id ??
    record.vaccine_id ??
    record.vaccine_code ??
    nested?.code ??
    nested?.name ??
    nested?.name_short;
  if (rawId === undefined || rawId === null) return null;

  const parsedId = toNumberIfPossible(rawId);
  const id: number | string = parsedId ?? String(rawId);

  const name =
    typeof record.name === 'string'
      ? record.name
      : typeof record.vaccine_name === 'string'
        ? record.vaccine_name
        : typeof nested?.name === 'string'
        ? nested.name
        : typeof nested?.name_short === 'string'
          ? nested.name_short
          : null;
  if (!name) return null;

  const vaccineIdCandidate = record.vaccine_id ?? record.id;
  const normalizedVaccineId =
    vaccineIdCandidate !== undefined && vaccineIdCandidate !== null
      ? toNumberIfPossible(vaccineIdCandidate) ?? String(vaccineIdCandidate)
      : undefined;

  const recommendedAge =
    toNumberIfPossible(record.recommended_age_months) ??
    toNumberIfPossible(nested?.recommended_age_months);

  const doses = toNumberIfPossible(record.doses) ?? toNumberIfPossible(nested?.doses);

  const status = typeof record.status === 'string' ? record.status : undefined;

  const scheduledDate =
    typeof record.scheduled_date === 'string' ? record.scheduled_date : undefined;
  const actualDate = typeof record.actual_date === 'string' ? record.actual_date : undefined;

  const administeredAt =
    typeof record.administered_at === 'string'
      ? record.administered_at
      : typeof record.date_administered === 'string'
        ? record.date_administered
        : actualDate;

  const childId =
    record.child_id !== undefined && record.child_id !== null
      ? String(record.child_id)
      : undefined;

  return {
    ...(record as Partial<Vaccine>),
    id,
    vaccine_id: normalizedVaccineId,
    vaccine_code:
      typeof record.vaccine_code === 'string'
        ? record.vaccine_code
        : typeof nested?.code === 'string'
        ? nested.code
        : undefined,
    name,
    name_short:
      typeof record.name_short === 'string'
        ? record.name_short
        : typeof nested?.name_short === 'string'
          ? nested.name_short
          : undefined,
    description:
      typeof record.description === 'string'
        ? record.description
        : typeof nested?.description === 'string'
        ? nested.description
        : undefined,
    timing_rule:
      typeof record.timing_rule === 'string'
        ? record.timing_rule
        : typeof nested?.timing_rule === 'string'
        ? nested.timing_rule
        : undefined,
    recommended_age_months: recommendedAge,
    doses,
    is_mandatory:
      typeof record.is_mandatory === 'boolean'
        ? record.is_mandatory
        : typeof nested?.is_mandatory === 'boolean'
        ? nested.is_mandatory
        : undefined,
    status,
    scheduled_date: scheduledDate,
    actual_date: actualDate,
    administered_at: administeredAt,
    date_administered:
      typeof record.date_administered === 'string'
        ? record.date_administered
        : actualDate,
    child_id: childId,
    vaccine:
      nested !== undefined
        ? {
            code: typeof nested.code === 'string' ? nested.code : undefined,
            name: typeof nested.name === 'string' ? nested.name : undefined,
            name_short:
              typeof nested.name_short === 'string' ? nested.name_short : undefined,
            description:
              typeof nested.description === 'string' ? nested.description : undefined,
            timing_rule:
              typeof nested.timing_rule === 'string' ? nested.timing_rule : undefined,
          }
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
  try {
    const data = await api.get<unknown>(
      API_ENDPOINTS.VACCINES_MASTER,
      { skipAuth: true },
    );
    return extractVaccineList(data);
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[VaccineService] getVaccines error:',
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
}

export async function getVaccinesByChild(childId: string): Promise<VaccineEnvelope> {
  try {
    const payload = await api.get<unknown>(API_ENDPOINTS.VACCINES_BY_CHILD(childId));
    if (!payload || typeof payload !== 'object') {
      return { vaccines: [] };
    }

    const root = payload as Record<string, unknown>;
    const childData =
      root.data && typeof root.data === 'object'
        ? (root.data as Record<string, unknown>)
        : root;
    const vaccines = extractVaccineList(childData.vaccines ?? childData);

    return {
      vaccines,
      birthDate:
        typeof childData.birth_date === 'string' && childData.birth_date.trim() !== ''
          ? childData.birth_date
          : undefined,
    };
  } catch (error) {
    if (__DEV__) {
      console.error(
        '[VaccineService] getVaccinesByChild error:',
        error instanceof Error ? error.message : error,
      );
    }
    throw error;
  }
}

export async function markVaccineDone(data: {
  vaccine_id: number;
  child_id: string;
  date_administered?: string;
}): Promise<void> {
  return api.post(API_ENDPOINTS.VACCINES_MARK_DONE, data);
}
