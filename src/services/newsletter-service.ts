import api from '../lib/api';

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
      '/kg/v1/newsletter/subscribe',
      payload,
      { skipAuth: true },
    );
  } catch (e: unknown) {
    const err = e as { message?: string } | null;
    return { success: false, message: err?.message ?? 'Bir hata oluştu.', code: 'network_error' };
  }
}
