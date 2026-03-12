import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import type { Child } from '../lib/types';

interface ActiveChildContextValue {
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
  clearActiveChild: () => void;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const [activeChild, setActiveChildState] = useState<Child | null>(null);

  const setActiveChild = useCallback((child: Child | null) => {
    setActiveChildState(child);
  }, []);

  const clearActiveChild = useCallback(() => {
    setActiveChildState(null);
  }, []);

  return (
    <ActiveChildContext.Provider
      value={{ activeChild, setActiveChild, clearActiveChild }}
    >
      {children}
    </ActiveChildContext.Provider>
  );
}

export function useActiveChild(): ActiveChildContextValue {
  const ctx = useContext(ActiveChildContext);
  if (!ctx) {
    throw new Error('useActiveChild must be used inside ActiveChildProvider');
  }
  return ctx;
}
