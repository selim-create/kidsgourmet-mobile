import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { ShoppingItem } from '../lib/types';

export async function getShoppingList(): Promise<ShoppingItem[]> {
  return api.get<ShoppingItem[]>(API_ENDPOINTS.SHOPPING_LIST);
}

export async function addShoppingItem(item: {
  name: string;
  category?: string;
  quantity?: string;
}): Promise<ShoppingItem> {
  return api.post<ShoppingItem>(API_ENDPOINTS.SHOPPING_LIST, item);
}

export async function updateShoppingItem(
  id: number,
  updates: Partial<ShoppingItem>,
): Promise<ShoppingItem> {
  return api.patch<ShoppingItem>(`${API_ENDPOINTS.SHOPPING_LIST}/${id}`, updates);
}

export async function deleteShoppingItem(id: number): Promise<void> {
  return api.delete(`${API_ENDPOINTS.SHOPPING_LIST}/${id}`);
}

export async function toggleShoppingItem(id: number): Promise<ShoppingItem> {
  return api.patch<ShoppingItem>(`${API_ENDPOINTS.SHOPPING_LIST}/${id}/toggle`);
}
