import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { Recipe } from '../lib/types';
import { getFavorites, toggleFavorite } from '../services/favorites-service';
import { useAuth } from './AuthContext';

interface FavoritesContextValue {
  favorites: Recipe[];
  favoriteIds: Set<number>;
  isLoading: boolean;
  toggle: (recipeId: number) => Promise<void>;
  isFavorite: (recipeId: number) => boolean;
  reload: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const favoriteIds = useMemo(
    () => new Set((favorites ?? []).map((r) => r.id)),
    [favorites],
  );

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getFavorites();
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = useCallback(
    async (recipeId: number) => {
      const was = favoriteIds.has(recipeId);
      // Optimistic update
      if (was) {
        setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
      }
      try {
        await toggleFavorite(recipeId);
        if (!was) {
          await load();
        }
      } catch {
        // revert on error
        await load();
      }
    },
    [favoriteIds, load],
  );

  const isFavorite = useCallback(
    (recipeId: number) => favoriteIds.has(recipeId),
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isLoading,
        toggle,
        isFavorite,
        reload: load,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used inside FavoritesProvider');
  }
  return ctx;
}
