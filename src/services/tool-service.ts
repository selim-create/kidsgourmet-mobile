import api from '../lib/api';
import { API_ENDPOINTS } from '../lib/constants';

export interface Tool {
  id: number;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  url?: string;
}

export async function getTools(): Promise<Tool[]> {
  return api.get<Tool[]>(API_ENDPOINTS.TOOLS, { skipAuth: true });
}
