import useSWR from 'swr';
import { getPublicProfile } from '../services/user-service';
import type { PublicProfile } from '../lib/types';

export function usePublicProfile(username?: string) {
  return useSWR<PublicProfile>(
    username ? ['/profile/public', username] : null,
    () => getPublicProfile(username!),
  );
}
