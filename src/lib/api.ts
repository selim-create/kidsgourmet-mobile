import * as SecureStore from 'expo-secure-store';
import { API_URL } from './constants';

// ─── Custom API Error ──────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const TOKEN_KEY = 'kg_auth_token';

// ─── Token Management ──────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ─── HTTP Client ───────────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function buildHeaders(skipAuth = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (!skipAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options;

  const baseHeaders = await buildHeaders(skipAuth);
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...baseHeaders,
      ...(extraHeaders as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message ?? errorData.error ?? errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(errorMessage, response.status);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }

  throw new ApiError('Unexpected non-JSON response from server', 0);
}

export async function apiRequestWithHeaders<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<{ data: T; headers: Record<string, string> }> {
  const { skipAuth = false, headers: extraHeaders, ...rest } = options;

  const baseHeaders = await buildHeaders(skipAuth);
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...baseHeaders,
      ...(extraHeaders as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message ?? errorData.error ?? errorMessage;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(errorMessage, response.status);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = (await response.json()) as T;
    const headers: Record<string, string> = {};
    response.headers.forEach((value: string, key: string) => {
      headers[key] = value;
    });
    return { data, headers };
  }

  throw new ApiError('Unexpected non-JSON response from server', 0);
}

// ─── Web-parallel named helpers ───────────────────────────────────────────────

/** Public (no auth) call — mirrors web's `fetchAPI`. */
export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(endpoint, { ...options, skipAuth: true });
}

/** Authenticated call (Bearer token) — mirrors web's `fetchAuthAPI`. */
export async function fetchAuthAPI<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return apiRequest<T>(endpoint, options);
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: 'GET', ...options }),

  getWithHeaders: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequestWithHeaders<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { method: 'DELETE', ...options }),
};

export default api;
