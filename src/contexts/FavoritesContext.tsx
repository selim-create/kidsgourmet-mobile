import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import type { Recipe } from '../lib/types';
import { getFavorites, addFavorite, removeFavorite } from '../services/favorites-service';
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
  /** IDs optimistically added but not yet confirmed by the server reload. */
  const [pendingAddIds, setPendingAddIds] = useState<Set<number>>(new Set());
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
    } catch (err) {
      console.error('[Favorites] Load error:', err);
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
      if (!isAuthenticated) {
        return;
      }
      const was = favoriteIds.has(recipeId) || pendingAddIds.has(recipeId);

      // Optimistic update — immediate UI feedback
      if (was) {
        setFavorites((prev) => prev.filter((r) => r.id !== recipeId));
        setPendingAddIds((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
      } else {
        setPendingAddIds((prev) => new Set([...prev, recipeId]));
      }

      try {
        if (was) {
          await removeFavorite(recipeId);
        } else {
          await addFavorite(recipeId);
        }
        await load();
      } catch (err) {
        console.error('[Favorites] Toggle error (recipeId=%d, was=%s):', recipeId, was, err);
        // Revert optimistic state on error
        if (!was) {
          setPendingAddIds((prev) => {
            const next = new Set(prev);
            next.delete(recipeId);
            return next;
          });
        }
        // Reload to restore server state
        await load();
      } finally {
        // Always clean up pending after the server sync
        setPendingAddIds((prev) => {
          const next = new Set(prev);
          next.delete(recipeId);
          return next;
        });
      }
    },
    [isAuthenticated, favoriteIds, pendingAddIds, load],
  );

  const isFavorite = useCallback(
    (recipeId: number) => favoriteIds.has(recipeId) || pendingAddIds.has(recipeId),
    [favoriteIds, pendingAddIds],
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
