import React from 'react';
import { SWRConfig } from 'swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        errorRetryCount: 2,
        onError: (error: Error) => {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[SWR Error]', error.message);
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
