import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

export async function getVaccines(): Promise<Vaccine[]> {
  const data = await api.get<Vaccine[] | Record<string, unknown>>(
    API_ENDPOINTS.VACCINES_MASTER,
    { skipAuth: true },
  );
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as Vaccine[];
    if (Array.isArray(obj.vaccines)) return obj.vaccines as Vaccine[];
    if (Array.isArray(obj.data)) return obj.data as Vaccine[];
  }
  return [];
}

export async function getVaccinesByChild(childId: string): Promise<Vaccine[]> {
  return api.get<Vaccine[]>(API_ENDPOINTS.VACCINES_BY_CHILD(childId));
}

export async function markVaccineDone(data: {
  vaccine_id: number;
  child_id: string;
  date_administered?: string;
}): Promise<void> {
  return api.post(API_ENDPOINTS.VACCINES_MARK_DONE, data);
}
