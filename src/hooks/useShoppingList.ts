import useSWR from 'swr';
import {
  getShoppingList,
  addShoppingListItem,
  removeShoppingListItem,
  toggleShoppingListItem,
  type AddShoppingItemPayload,
} from '../services/shopping-list-service';
import type { ShoppingListItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export function useShoppingList() {
  const { isAuthenticated } = useAuth();

  const key = isAuthenticated ? API_ENDPOINTS.SHOPPING_LIST : null;

  const { data, error, isLoading, mutate } = useSWR<ShoppingListItem[]>(
    key,
    () => getShoppingList(),
  );

  const addItem = async (item: AddShoppingItemPayload) => {
    const optimisticItem: ShoppingListItem = {
      id: `optimistic-${Date.now()}`,
      ingredient: item.ingredient,
      amount: item.amount ?? '',
      checked: false,
      category: item.category,
      recipe_id: item.recipe_id,
      recipe_title: item.recipe_title,
      name: item.ingredient,
      is_checked: false,
      quantity: item.amount,
    };
    await mutate(
      async (current) => {
        const added = await addShoppingListItem(item);
        return [...(current ?? []), added];
      },
      { optimisticData: [...(data ?? []), optimisticItem], rollbackOnError: true },
    );
  };

  const removeItem = async (id: string | number) => {
    await mutate(
      async (current) => {
        await removeShoppingListItem(id);
        return (current ?? []).filter((i) => String(i.id) !== String(id));
      },
      {
        optimisticData: (data ?? []).filter((i) => String(i.id) !== String(id)),
        rollbackOnError: true,
      },
    );
  };

  const toggleItem = async (id: string | number, checked: boolean) => {
    const optimistic = (data ?? []).map((i) =>
      String(i.id) === String(id)
        ? { ...i, checked, is_checked: checked }
        : i,
    );
    await mutate(
      async (current) => {
        const updated = await toggleShoppingListItem(id, checked);
        return (current ?? []).map((i) => (String(i.id) === String(id) ? updated : i));
      },
      { optimisticData: optimistic, rollbackOnError: true },
    );
  };

  return {
    items: Array.isArray(data) ? data : [],
    isLoading,
    error,
    refresh: mutate,
    mutate,
    addItem,
    removeItem,
    toggleItem,
  };
}

