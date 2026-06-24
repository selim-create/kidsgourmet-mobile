import api, { getToken } from '../lib/api';
import { API_ENDPOINTS, API_URL } from '../lib/constants';
import type { User, Child, PublicProfile, ExpertPublicProfile } from '../lib/types';

const AVATAR_UPLOAD_ERROR = 'Avatar yüklenemedi';

function toAbsoluteUrl(value?: string | null): string | null | undefined {
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function normalizeChild(child: Child): Child {
  return {
    ...child,
    avatar_url: toAbsoluteUrl(child.avatar_url ?? child.avatar_path ?? null) ?? null,
  };
}

export function normalizeUserProfile(user: User): User {
  const raw = user as User & {
    avatar?: string | null;
    profile_image?: string | null;
  };

  return {
    ...user,
    name: user.name ?? user.display_name ?? '',
    avatar_url: toAbsoluteUrl(user.avatar_url ?? raw.avatar ?? raw.profile_image ?? null) ?? null,
    children: Array.isArray(user.children) ? user.children.map(normalizeChild) : user.children,
  };
}
export interface ChildUpsertPayload {
  name: string;
  birth_date: string;
  gender?: Child['gender'];
  allergies?: string[];
  diet_types?: string[];
  notes?: string;
  kvkk_consent?: boolean;
  guardian_declaration?: boolean;
  guardian_declaration_at?: string | null;
  sensitive_data_consent?: boolean;
  sensitive_data_consent_at?: string | null;
  terms_accepted?: boolean;
  terms_accepted_at?: string | null;
}

export async function getUserProfile(): Promise<User> {
  const profile = await api.get<User>(API_ENDPOINTS.PROFILE);
  return normalizeUserProfile(profile);
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  const profile = await api.put<User>(API_ENDPOINTS.PROFILE, data);
  return normalizeUserProfile(profile);
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
  const children = await api.get<Child[]>(API_ENDPOINTS.CHILDREN);
  return children.map(normalizeChild);
}

export async function getChild(uuid: string): Promise<Child> {
  const child = await api.get<Child>(API_ENDPOINTS.CHILD_PROFILE(uuid));
  return normalizeChild(child);
}

export async function createChild(data: ChildUpsertPayload): Promise<Child> {
  const child = await api.post<Child>(API_ENDPOINTS.CHILDREN, data);
  return normalizeChild(child);
}

export async function updateChild(uuid: string, data: Partial<ChildUpsertPayload>): Promise<Child> {
  const child = await api.put<Child>(API_ENDPOINTS.CHILD_PROFILE(uuid), data);
  return normalizeChild(child);
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
