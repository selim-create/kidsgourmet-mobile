import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Vaccine } from '../lib/types';

export async function getVaccines(): Promise<Vaccine[]> {
  return api.get<Vaccine[]>(API_ENDPOINTS.VACCINES, { skipAuth: true });
}
