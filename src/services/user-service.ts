import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';
import type { User, Child } from '../lib/types';

export async function getUserProfile(): Promise<User> {
  return api.get<User>(API_ENDPOINTS.PROFILE);
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
  return api.put<User>(API_ENDPOINTS.PROFILE, data);
}

export async function getChildren(): Promise<Child[]> {
  return api.get<Child[]>(API_ENDPOINTS.CHILDREN);
}

export async function getChild(id: number): Promise<Child> {
  return api.get<Child>(API_ENDPOINTS.CHILD(id));
}

export async function createChild(data: Omit<Child, 'id'>): Promise<Child> {
  return api.post<Child>(API_ENDPOINTS.CHILDREN, data);
}

export async function updateChild(
  id: number,
  data: Partial<Child>,
): Promise<Child> {
  return api.put<Child>(API_ENDPOINTS.CHILD(id), data);
}

export async function deleteChild(id: number): Promise<void> {
  return api.delete(API_ENDPOINTS.CHILD(id));
}

export async function uploadChildAvatar(
  id: number,
  formData: FormData,
): Promise<Child> {
  return api.post<Child>(API_ENDPOINTS.AVATAR(id), formData, {
    headers: { 'Content-Type': 'multipart/form-data' } as HeadersInit,
  });
}
