import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function sendContactForm(data: ContactFormData): Promise<{ success: boolean }> {
  return api.post<{ success: boolean }>(API_ENDPOINTS.CONTACT, data, {
    skipAuth: true,
  });
}
