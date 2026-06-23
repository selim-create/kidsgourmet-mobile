import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { BackendShoppingListItem, ShoppingListItem, ShoppingCategory } from '../lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapBackendItem(raw: BackendShoppingListItem): ShoppingListItem {
  return {
    id: raw.id,
    ingredient: raw.item,
    amount: raw.quantity,
    checked: raw.checked,
    category: raw.category,
    recipe_id: raw.recipe_id,
    recipe_title: raw.recipe_title,
    // legacy aliases
    name: raw.item,
    is_checked: raw.checked,
    quantity: raw.quantity,
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

export async function getShoppingList(): Promise<ShoppingListItem[]> {
  const raw = await api.get<BackendShoppingListItem[] | { items?: BackendShoppingListItem[] }>(
    API_ENDPOINTS.SHOPPING_LIST,
  );
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  return items.map(mapBackendItem);
}

export interface AddShoppingItemPayload {
  ingredient: string;
  amount?: string;
  category?: ShoppingCategory | string;
  recipe_id?: number;
  recipe_title?: string;
}

export async function addShoppingListItem(
  item: AddShoppingItemPayload,
): Promise<ShoppingListItem> {
  const payload = {
    item: item.ingredient,
    quantity: item.amount ?? '',
    category: item.category,
    recipe_id: item.recipe_id,
    recipe_title: item.recipe_title,
  };
  const raw = await api.post<BackendShoppingListItem>(API_ENDPOINTS.SHOPPING_LIST, payload);
  return mapBackendItem(raw);
}

export async function addShoppingListItems(
  items: AddShoppingItemPayload[],
): Promise<ShoppingListItem[]> {
  const results: ShoppingListItem[] = [];
  for (const item of items) {
    const added = await addShoppingListItem(item);
    results.push(added);
  }
  return results;
}

export async function removeShoppingListItem(id: string | number): Promise<void> {
  await api.delete(API_ENDPOINTS.SHOPPING_LIST_ITEM(id));
}

export async function toggleShoppingListItem(
  id: string | number,
  checked: boolean,
): Promise<ShoppingListItem> {
  const raw = await api.patch<BackendShoppingListItem>(
    API_ENDPOINTS.SHOPPING_LIST_ITEM_TOGGLE(id),
    { checked },
  );
  return mapBackendItem(raw);
}

export async function updateShoppingListItem(
  id: string | number,
  updates: Partial<AddShoppingItemPayload>,
): Promise<ShoppingListItem> {
  const payload: Record<string, unknown> = {};
  if (updates.ingredient !== undefined) payload.item = updates.ingredient;
  if (updates.amount !== undefined) payload.quantity = updates.amount;
  if (updates.category !== undefined) payload.category = updates.category;
  const raw = await api.patch<BackendShoppingListItem>(
    API_ENDPOINTS.SHOPPING_LIST_ITEM(id),
    payload,
  );
  return mapBackendItem(raw);
}

export interface GenerateShoppingListPayload {
  meal_plan_id?: number;
  week?: string;
  child_id?: string;
}

export async function generateShoppingList(
  payload: GenerateShoppingListPayload,
): Promise<ShoppingListItem[]> {
  const raw = await api.post<BackendShoppingListItem[] | { items?: BackendShoppingListItem[] }>(
    API_ENDPOINTS.SHOPPING_LIST_GENERATE,
    payload,
  );
  const items = Array.isArray(raw) ? raw : (raw?.items ?? []);
  return items.map(mapBackendItem);
}

// ─── Legacy aliases (kept for backward compatibility) ─────────────────────────

/** @deprecated Use addShoppingListItem */
export async function addShoppingItem(item: {
  name: string;
  category?: string;
  quantity?: string;
}): Promise<ShoppingListItem> {
  return addShoppingListItem({ ingredient: item.name, amount: item.quantity, category: item.category });
}

/** @deprecated Use removeShoppingListItem */
export async function deleteShoppingItem(id: number): Promise<void> {
  return removeShoppingListItem(id);
}

/** @deprecated Use toggleShoppingListItem */
export async function toggleShoppingItem(id: number): Promise<ShoppingListItem> {
  return toggleShoppingListItem(id, true);
}

/** @deprecated Use updateShoppingListItem */
export async function updateShoppingItem(
  id: number,
  updates: Partial<ShoppingListItem>,
): Promise<ShoppingListItem> {
  return updateShoppingListItem(id, {
    ingredient: updates.ingredient ?? updates.name,
    amount: updates.amount ?? updates.quantity,
    category: updates.category,
  });
}

