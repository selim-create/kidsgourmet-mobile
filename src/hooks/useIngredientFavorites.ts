import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'ingredient-favorites';

/**
 * Persists ingredient favorites as an array of slugs in SecureStore.
 * Syncs between the list page and the detail page.
 */
export function useIngredientFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) setFavorites(parsed);
          } catch {
            // Ignore corrupt data
          }
        }
      })
      .catch(() => {});
  }, []);

  const isFavorite = useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const toggle = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next)).catch(
        () => {},
      );
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggle };
}
