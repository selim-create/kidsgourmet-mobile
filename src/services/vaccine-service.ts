import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

export async function getVaccines(): Promise<Vaccine[]> {
  return api.get<Vaccine[]>(API_ENDPOINTS.VACCINES_MASTER, { skipAuth: true });
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
