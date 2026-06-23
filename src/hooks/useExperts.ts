import useSWR from 'swr';
import { getExperts } from '../services/user-service';
import type { ExpertPublicProfile } from '../lib/types';

export function useExperts() {
  return useSWR<ExpertPublicProfile[]>('/experts', () => getExperts());
}
