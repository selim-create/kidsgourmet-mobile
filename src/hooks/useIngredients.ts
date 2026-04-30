import { useState, useEffect, useCallback, useRef } from 'react';
import { ingredientService } from '../services/ingredient-service';
import type { IngredientGuideItem, IngredientGuideResponse } from '../lib/types';

const ITEMS_PER_PAGE = 12;
const SEARCH_DEBOUNCE_MS = 500;

export interface UseIngredientsResult {
  ingredients: IngredientGuideItem[];
  categories: string[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  totalItems: number;
  error: Error | null;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  activeSeasons: string[];
  toggleSeason: (s: string) => void;
  clearSeasons: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loadMore: () => void;
  refresh: () => void;
}

export function useIngredients(_legacyFilters?: { search?: string; age?: number }): UseIngredientsResult {
  const [ingredients, setIngredients] = useState<IngredientGuideItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['Tümü']);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const [activeCategory, setActiveCategoryRaw] = useState<string>('Tümü');
  const [activeSeasons, setActiveSeasons] = useState<string[]>([]);
  const [searchQuery, setSearchQueryRaw] = useState<string>('');

  const pageRef = useRef(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debouncedQueryRef = useRef<string>('');

  // ─── Load categories once ─────────────────────────────────────────────────
  useEffect(() => {
    ingredientService
      .getCategories()
      .then((cats) => setCategories(['Tümü', ...cats]))
      .catch(() => setCategories(['Tümü']));
  }, []);

  // ─── Core fetch logic ─────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      if (page === 1) setIsLoading(true);
      else setIsLoadingMore(true);
      setError(null);

      try {
        const dq = debouncedQueryRef.current;

        if (dq.length >= 2) {
          // Search mode — no pagination
          const results = await ingredientService.search(dq);
          setIngredients(results);
          setHasMore(false);
          setTotalItems(results.length);
        } else {
          // Normal listing mode
          const cat = activeCategory === 'Tümü' ? undefined : activeCategory;
          const raw = await ingredientService.getAll({
            page,
            perPage: ITEMS_PER_PAGE,
            category: cat,
          });

          let newItems: IngredientGuideItem[];
          let total: number;
          let pages: number;

          if (Array.isArray(raw)) {
            newItems = raw;
            total = raw.length;
            pages = 1;
          } else {
            const resp = raw as IngredientGuideResponse;
            newItems = resp.ingredients;
            total = resp.total;
            pages = resp.pages;
          }

          // Client-side season filter
          if (activeSeasons.length > 0) {
            newItems = newItems.filter((ing) =>
              activeSeasons.some((s) => {
                if (!ing.season) return false;
                const seasons = Array.isArray(ing.season)
                  ? ing.season
                  : ing.season.split(',').map((x) => x.trim());
                return seasons.includes(s) || seasons.includes('Tümü');
              }),
            );
          }

          if (append) {
            setIngredients((prev) => [...prev, ...newItems]);
          } else {
            setIngredients(newItems);
          }

          setTotalItems(total);
          setHasMore(page < pages);
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeCategory, activeSeasons],
  );

  // ─── Reset + fetch when category/seasons change ───────────────────────────
  useEffect(() => {
    pageRef.current = 1;
    fetchPage(1, false);
  }, [fetchPage]);

  // ─── Debounced search ─────────────────────────────────────────────────────
  const setSearchQuery = useCallback(
    (q: string) => {
      setSearchQueryRaw(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debouncedQueryRef.current = q;
        pageRef.current = 1;
        fetchPage(1, false);
      }, SEARCH_DEBOUNCE_MS);
    },
    [fetchPage],
  );

  // ─── Category setter (resets list) ───────────────────────────────────────
  const setActiveCategory = useCallback((c: string) => {
    setActiveCategoryRaw(c);
    pageRef.current = 1;
  }, []);

  // ─── Season toggle ────────────────────────────────────────────────────────
  const toggleSeason = useCallback((s: string) => {
    setActiveSeasons((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    pageRef.current = 1;
  }, []);

  const clearSeasons = useCallback(() => {
    setActiveSeasons([]);
    pageRef.current = 1;
  }, []);

  // ─── Pagination ───────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const nextPage = pageRef.current + 1;
    pageRef.current = nextPage;
    fetchPage(nextPage, true);
  }, [isLoadingMore, hasMore, fetchPage]);

  // ─── Refresh ─────────────────────────────────────────────────────────────
  const refresh = useCallback(() => {
    pageRef.current = 1;
    fetchPage(1, false);
  }, [fetchPage]);

  return {
    ingredients,
    categories,
    isLoading,
    isLoadingMore,
    hasMore,
    totalItems,
    error,
    activeCategory,
    setActiveCategory,
    activeSeasons,
    toggleSeason,
    clearSeasons,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  };
}

