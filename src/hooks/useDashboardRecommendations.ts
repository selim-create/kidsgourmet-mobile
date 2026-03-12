import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import { getDashboardRecommendations } from '../services/recommendation-service';
import type { Recipe } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useDashboardRecommendations() {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  // Dashboard recommendations require both authentication and an active child
  const key =
    isAuthenticated && activeChild
      ? `${API_ENDPOINTS.RECOMMENDATIONS_DASHBOARD}?child_id=${activeChild.id}`
      : null;

  const { data, error, isLoading } = useSWR<Recipe[]>(
    key,
    () => getDashboardRecommendations(activeChild!.id),
  );

  return {
    recommendations: Array.isArray(data) ? data : [],
    isLoading,
    error,
  };
}
