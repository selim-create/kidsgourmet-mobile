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
  children: Child[];
  setActiveChild: (child: Child | null) => void;
  clearActiveChild: () => void;
  reloadChildren: () => Promise<void>;
}

const ActiveChildContext = createContext<ActiveChildContextValue | null>(null);

export function ActiveChildProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [activeChild, setActiveChildState] = useState<Child | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);

  const loadChildren = useCallback(async () => {
    if (!isAuthenticated) {
      setChildList([]);
      setActiveChildState(null);
      return;
    }
    try {
      const list = await getChildren();
      if (list && list.length > 0) {
        setChildList(list);
        // Only set active child if not already set
        setActiveChildState((prev) => prev ?? list[0]);
      } else {
        setChildList([]);
      }
    } catch {
      // ignore errors
    }
  }, [isAuthenticated]);

  // Load children and set the first as active when authenticated
  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const setActiveChild = useCallback((child: Child | null) => {
    setActiveChildState(child);
  }, []);

  const clearActiveChild = useCallback(() => {
    setActiveChildState(null);
  }, []);

  return (
    <ActiveChildContext.Provider
      value={{
        activeChild,
        children: childList,
        setActiveChild,
        clearActiveChild,
        reloadChildren: loadChildren,
      }}
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
