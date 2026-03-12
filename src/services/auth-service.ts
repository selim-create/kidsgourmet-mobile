import api, { setToken, removeToken } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../lib/types';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.LOGIN,
    credentials,
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
  return api.get<User>(API_ENDPOINTS.PROFILE);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  return api.put<User>(API_ENDPOINTS.PROFILE, data);
}
