import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import api from '../lib/api';
import type { User } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function useUser() {
  const { isAuthenticated } = useAuth();

  const { data, error, mutate, isLoading } = useSWR<User>(
    isAuthenticated ? API_ENDPOINTS.PROFILE : null,
    () => api.get<User>(API_ENDPOINTS.PROFILE),
  );

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}
