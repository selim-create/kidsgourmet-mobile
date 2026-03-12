import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import type { Child } from '../lib/types';
import { getChildren } from '../services/user-service';
import { useAuth } from './AuthContext';

interface ActiveChildContextValue {
  activeChild: Child | null;
  setActiveChild: (child: Child | null) => void;
  clearActiveChild: () => void;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [activeChild, setActiveChildState] = useState<Child | null>(null);

  // Load children and set the first as active when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setActiveChildState(null);
      return;
    }
    getChildren()
      .then((childList) => {
        if (childList && childList.length > 0) {
          // Use functional update to avoid stale closure — only set if not already set
          setActiveChildState((prev) => prev ?? childList[0]);
        }
      })
      .catch(() => {
        // ignore errors
      });
  }, [isAuthenticated]);

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
