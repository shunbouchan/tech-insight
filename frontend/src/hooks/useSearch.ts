'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { SearchResult } from '@/types/article';
import { SearchParams } from '@/types/api';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';

interface UseSearchState {
  results: SearchResult[];
  total: number;
  isLoading: boolean;
  error: string | null;
  query: string;
}

interface UseSearchReturn extends UseSearchState {
  search: (params: SearchParams) => Promise<void>;
  setQuery: (query: string) => void;
  clearResults: () => void;
}

export function useSearch(category?: string): UseSearchReturn {
  const [state, setState] = useState<UseSearchState>({
    results: [],
    total: 0,
    isLoading: false,
    error: null,
    query: '',
  });

  const debouncedQuery = useDebounce(state.query, SEARCH_DEBOUNCE_MS);

  const search = useCallback(async (params: SearchParams) => {
    if (!params.q.trim()) {
      setState((prev) => ({
        ...prev,
        results: [],
        total: 0,
        isLoading: false,
        error: null,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await api.search(params);
      setState((prev) => ({
        ...prev,
        results: response.results,
        total: response.total,
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Search failed',
      }));
    }
  }, []);

  const setQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, query }));
  }, []);

  const clearResults = useCallback(() => {
    setState({
      results: [],
      total: 0,
      isLoading: false,
      error: null,
      query: '',
    });
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      search({ q: debouncedQuery, category });
    } else {
      setState((prev) => ({
        ...prev,
        results: [],
        total: 0,
      }));
    }
  }, [debouncedQuery, category, search]);

  return {
    ...state,
    search,
    setQuery,
    clearResults,
  };
}
