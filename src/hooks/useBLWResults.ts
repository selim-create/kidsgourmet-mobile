import useSWR from 'swr';
import { getBLWTestResults } from '../services/blw-service';
import type { BLWTestResult } from '../lib/types';
import { API_ENDPOINTS } from '../lib/constants';
import { useAuth } from '../contexts/AuthContext';
import { useActiveChild } from '../contexts/ActiveChildContext';

export function useBLWResults() {
  const { isAuthenticated } = useAuth();
  const { activeChild } = useActiveChild();

  const key =
    isAuthenticated && activeChild
      ? `${API_ENDPOINTS.TOOL_BLW_RESULTS}?child_id=${activeChild.id}`
      : null;

  const { data, error, isLoading } = useSWR<BLWTestResult | null>(
    key,
    () => getBLWTestResults(activeChild!.id),
  );

  return {
    blwResult: data ?? null,
    isLoading,
    error,
  };
}
