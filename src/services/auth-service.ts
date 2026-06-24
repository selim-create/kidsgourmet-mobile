import api, { setToken, removeToken } from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../lib/types';
import { normalizeUserProfile } from './user-service';
function unwrapProfileResponse(
  response: User | { success?: boolean; message?: string; data?: User; user?: User },
  fallbackError: string,
): User {
  const raw = response as Record<string, unknown>;

  if (typeof raw.success === 'boolean') {
    if (!raw.success) {
      throw new Error((raw.message as string | undefined) ?? fallbackError);
    }
    return (raw.data as User | undefined) ?? (raw.user as User | undefined) ?? (response as User);
  }

  return (raw.data as User | undefined) ?? (raw.user as User | undefined) ?? (response as User);
}

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
  const response = await api.get<User | { success?: boolean; data?: User; user?: User }>(API_ENDPOINTS.USER_ME);
  let profile = unwrapProfileResponse(response, 'Profil getirilemedi');
  const rawProfile = profile as User & { avatar?: unknown };

  if (!rawProfile.avatar_url && !rawProfile.avatar) {
    try {
      const richerResponse = await api.get<User | { success?: boolean; data?: User; user?: User }>(API_ENDPOINTS.USER_PROFILE);
      const richerProfile = unwrapProfileResponse(richerResponse, 'Profil getirilemedi');
      profile = { ...profile, ...richerProfile };
    } catch {
      // /user/me data is still usable
    }
  }

  return normalizeUserProfile(profile);
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await api.put<User | { success?: boolean; message?: string; data?: User; user?: User }>(
    API_ENDPOINTS.USER_PROFILE,
    data,
  );
  const profile = unwrapProfileResponse(response, 'Profil güncellenemedi');
  if (!profile || typeof profile !== 'object' || !('id' in profile)) {
    return getProfile();
  }
  return normalizeUserProfile(profile);
}

export async function signInWithGoogle(idToken: string): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.AUTH_GOOGLE,
    { id_token: idToken },
    { skipAuth: true },
  );
  if (response?.token) {
    await setToken(response.token);
  }
  return response;
}

export async function signInWithApple(
  identityToken: string,
  name?: { givenName?: string | null; familyName?: string | null },
): Promise<AuthResponse> {
  const payload: Record<string, unknown> = { identity_token: identityToken };
  if (name && (name.givenName || name.familyName)) {
    payload.name = {
      given_name: name.givenName ?? null,
      family_name: name.familyName ?? null,
    };
  }
  const response = await api.post<AuthResponse>(
    API_ENDPOINTS.AUTH_APPLE,
    payload,
    { skipAuth: true },
  );
  if (response?.token) {
    await setToken(response.token);
  }
  return response;
}
