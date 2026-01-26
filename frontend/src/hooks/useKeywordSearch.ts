'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ArticleSummary } from '@/types/article';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

interface UseKeywordSearchState {
  results: ArticleSummary[];
  isLoading: boolean;
  error: string | null;
  query: string;
}

interface UseKeywordSearchReturn extends UseKeywordSearchState {
  setQuery: (query: string) => void;
  clearResults: () => void;
}

export function useKeywordSearch(category?: string): UseKeywordSearchReturn {
  const [state, setState] = useState<UseKeywordSearchState>({
    results: [],
    isLoading: false,
    error: null,
    query: '',
  });

  const debouncedQuery = useDebounce(state.query, SEARCH_DEBOUNCE_MS);

  const search = useCallback(
    async (keyword: string, cat?: string) => {
      if (!keyword.trim()) {
        setState((prev) => ({
          ...prev,
          results: [],
          isLoading: false,
          error: null,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.articles.list({
          keyword,
          category: cat,
        });
        setState((prev) => ({
          ...prev,
          results: response.items,
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'キーワード検索に失敗しました',
        }));
      }
    },
    []
  );

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      results: [],
      isLoading: false,
      error: null,
      query: '',
    });
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      search(debouncedQuery, category);
    } else {
      setState((prev) => ({
        ...prev,
        results: [],
      }));
    }
  }, [debouncedQuery, category, search]);

  return {
    ...state,
    setQuery,
    clearResults,
  };
}
