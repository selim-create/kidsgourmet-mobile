import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

export interface NewsletterSubscriptionRequest {
  email: string;
  name?: string;
  source: string;
  interests?: string[];
}

export interface NewsletterResponse {
  success: boolean;
  message: string;
  data?: { email?: string; status?: string };
  code?: string;
}

export async function subscribeNewsletter(
  payload: NewsletterSubscriptionRequest,
): Promise<NewsletterResponse> {
  try {
    return await api.post<NewsletterResponse>(
      API_ENDPOINTS.NEWSLETTER_SUBSCRIBE,
      payload,
      { skipAuth: true },
    );
  } catch (e: unknown) {
    const err = e as { message?: string } | null;
    return { success: false, message: err?.message ?? 'Bir hata oluştu.', code: 'network_error' };
  }
}
