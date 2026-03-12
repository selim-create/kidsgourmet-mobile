import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { Allergen, ChildAllergen } from '../lib/types';

export async function getAllergens(): Promise<Allergen[]> {
  return api.get<Allergen[]>(API_ENDPOINTS.ALLERGENS, { skipAuth: true });
}

export async function getChildAllergens(childId: number): Promise<ChildAllergen[]> {
  return api.get<ChildAllergen[]>(API_ENDPOINTS.CHILD_ALLERGENS(childId));
}

export async function addChildAllergen(
  childId: number,
  allergenId: number,
  severity?: ChildAllergen['severity'],
): Promise<ChildAllergen> {
  return api.post<ChildAllergen>(API_ENDPOINTS.CHILD_ALLERGENS(childId), {
    allergen_id: allergenId,
    severity,
  });
}

export async function removeChildAllergen(
  childId: number,
  allergenId: number,
): Promise<void> {
  return api.delete(`${API_ENDPOINTS.CHILD_ALLERGENS(childId)}/${allergenId}`);
}
