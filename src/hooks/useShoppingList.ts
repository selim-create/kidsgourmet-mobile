import useSWR from 'swr';
import { getShoppingList } from '../services/shopping-list-service';
import type { ShoppingItem } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';

export function useShoppingList() {
  const { isAuthenticated } = useAuth();

  const key = isAuthenticated ? API_ENDPOINTS.SHOPPING_LIST : null;

  const { data, error, isLoading, mutate } = useSWR<ShoppingItem[]>(
    key,
    () => getShoppingList(),
  );

  return {
    items: Array.isArray(data) ? data : [],
    isLoading,
    error,
    mutate,
  };
}
