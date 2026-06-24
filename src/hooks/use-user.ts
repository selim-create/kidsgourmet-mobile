import useSWR from 'swr';
import { API_ENDPOINTS } from '../lib/constants';
import api from '../lib/api';
import type { User } from '../lib/types';
import { useAuth } from '../contexts/AuthContext';

export function useUser() {
  const { isAuthenticated } = useAuth();

  const { data, error, mutate, isLoading } = useSWR<User>(
    isAuthenticated ? API_ENDPOINTS.USER_ME : null,
    () => api.get<User>(API_ENDPOINTS.USER_ME),
  );

  return {
    user: data,
    isLoading,
    error,
    mutate,
  };
}
