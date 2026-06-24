import api, { setToken, removeToken } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../lib/types';
import { normalizeUserProfile } from './user-service';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.LOGIN,
    {
      email: credentials.username, // Backend expects 'email' parameter
      password: credentials.password,
    },
    { skipAuth: true },
  );
  if (response.token) {
    await setToken(response.token);
  }
  return response;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.REGISTER,
    data,
    { skipAuth: true },
  );
  if (response.token) {
    await setToken(response.token);
  }
  return response;
}

export async function logout(): Promise<void> {
  try {
    await api.post(API_ENDPOINTS.LOGOUT);
  } catch {
    // ignore server errors on logout
  } finally {
    await removeToken();
  }
}

export async function getProfile(): Promise<User> {
  const profile = await api.get<User>(API_ENDPOINTS.PROFILE);
  return normalizeUserProfile(profile);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const profile = await api.put<User>(API_ENDPOINTS.PROFILE, data);
  return normalizeUserProfile(profile);
}
