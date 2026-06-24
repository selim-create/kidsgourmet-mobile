import React, { useRef } from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  // [KG-DEBUG] Track SWR errors in __DEV__ to surface failing keys
  const failedKeysRef = useRef<{ key: string; time: number }[]>([]);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 2,
        onError: (error: Error, key: string) => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[SWR Error]', error.message);
            if (__DEV__) {
              const now = Date.now();
              failedKeysRef.current = [
                ...failedKeysRef.current.filter((e) => now - e.time < 30_000),
                { key: String(key), time: now },
              ];
              console.warn(
                '[KG-DEBUG] SWR keys failed in last 30s:',
                failedKeysRef.current.map((e) => e.key),
              );
            }
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
