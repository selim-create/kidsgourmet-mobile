import api, { getToken } from '../lib/api';
import { API_ENDPOINTS, API_URL } from '../lib/constants';
import type { User, Child, PublicProfile, ExpertPublicProfile } from '../lib/types';

const AVATAR_UPLOAD_ERROR = 'Avatar yüklenemedi';
export async function getUserProfile(): Promise<User> {
  return api.get<User>(API_ENDPOINTS.PROFILE);
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  return api.put<User>(API_ENDPOINTS.PROFILE, data);
}

/** Upload current user's avatar (uses fetch directly to handle FormData properly in RN) */
export async function uploadUserAvatar(
  asset: { uri: string; mimeType?: string | null; fileName?: string | null },
): Promise<{ id: number; url: string }> {
  const token = await getToken();
  if (!token) throw new Error('Authentication required');

  const formData = new FormData();
  formData.append('file', {
    uri: asset.uri,
    type: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? 'avatar.jpg',
  } as unknown as Blob);

  const response = await fetch(`${API_URL}${API_ENDPOINTS.USER_AVATAR}`, {
    method: 'POST',
    headers: {
      // IMPORTANT: do NOT set Content-Type — React Native sets the multipart boundary automatically
      Authorization: 'Bearer ' + token,
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? AVATAR_UPLOAD_ERROR);
  }

  const data = await response.json() as { id: number; source_url?: string; url?: string };
  return { id: data.id, url: data.source_url ?? data.url ?? '' };
}

export async function getChildren(): Promise<Child[]> {
  return api.get<Child[]>(API_ENDPOINTS.CHILDREN);
}

export async function getChild(uuid: string): Promise<Child> {
  return api.get<Child>(API_ENDPOINTS.CHILD_PROFILE(uuid));
}

export async function createChild(data: Omit<Child, 'id'>): Promise<Child> {
  return api.post<Child>(API_ENDPOINTS.CHILDREN, data);
}

export async function updateChild(uuid: string, data: Partial<Child>): Promise<Child> {
  return api.put<Child>(API_ENDPOINTS.CHILD_PROFILE(uuid), data);
}

export async function deleteChild(uuid: string): Promise<void> {
  return api.delete(API_ENDPOINTS.CHILD_PROFILE(uuid));
}

/** Upload child avatar — uses the NEW UUID-based endpoint */
export async function uploadChildAvatar(
  uuid: string,
  asset: { uri: string; mimeType?: string | null; fileName?: string | null },
): Promise<{ avatar?: { url?: string }; url?: string; avatar_url?: string }> {
  const token = await getToken();
  if (!token) throw new Error('Authentication required');

  const formData = new FormData();
  formData.append('avatar', {
    uri: asset.uri,
    type: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? 'avatar.jpg',
  } as unknown as Blob);

  const response = await fetch(
    `${API_URL}${API_ENDPOINTS.CHILD_PROFILE_AVATAR(uuid)}`,
    {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? AVATAR_UPLOAD_ERROR);
  }

  return response.json() as Promise<{ avatar?: { url?: string }; url?: string; avatar_url?: string }>;
}

/** Get fresh signed avatar URL for a child (~15 min expiry) */
export async function getChildAvatarUrl(uuid: string): Promise<{ url: string; expires_in: number }> {
  return api.get<{ url: string; expires_in: number }>(
    API_ENDPOINTS.CHILD_PROFILE_AVATAR(uuid),
  );
}

export async function deleteChildAvatar(uuid: string): Promise<void> {
  return api.delete(API_ENDPOINTS.CHILD_PROFILE_AVATAR(uuid));
}

/** Public user profile (NO auth) */
export async function getPublicProfile(username: string): Promise<PublicProfile> {
  const clean = username.startsWith('@') ? username.slice(1) : username;
  return api.get<PublicProfile>(API_ENDPOINTS.USER_PUBLIC(clean), { skipAuth: true });
}

/** Expert public profile (NO auth) */
export async function getExpertPublicProfile(username: string): Promise<ExpertPublicProfile> {
  const clean = username.startsWith('@') ? username.slice(1) : username;
  return api.get<ExpertPublicProfile>(API_ENDPOINTS.EXPERT_PUBLIC(clean), { skipAuth: true });
}

/** Expert list (NO auth) */
export async function getExperts(): Promise<ExpertPublicProfile[]> {
  return api.get<ExpertPublicProfile[]>(API_ENDPOINTS.EXPERTS_LIST, { skipAuth: true });
}
