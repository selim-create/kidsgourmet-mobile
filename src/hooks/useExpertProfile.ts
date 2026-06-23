import useSWR from 'swr';
import { getExpertPublicProfile } from '../services/user-service';
import type { ExpertPublicProfile } from '../lib/types';

export function useExpertPublicProfile(username?: string) {
  return useSWR<ExpertPublicProfile>(
    username ? ['/expert/public', username] : null,
    () => getExpertPublicProfile(username!),
  );
}
