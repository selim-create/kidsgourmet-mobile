import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

export async function getVaccines(): Promise<Vaccine[]> {
  return api.get<Vaccine[]>(API_ENDPOINTS.VACCINES_MASTER, { skipAuth: true });
}

export async function getVaccinesByChild(childId: string): Promise<Vaccine[]> {
  return api.get<Vaccine[]>(API_ENDPOINTS.VACCINES_BY_CHILD(childId));
}
