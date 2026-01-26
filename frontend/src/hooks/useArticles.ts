'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';
import { ArticleSummary, Pagination } from '@/types/article';
import { ArticleListParams } from '@/types/api';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

interface UseArticlesState {
  articles: ArticleSummary[];
  pagination: Pagination | null;
  isLoading: boolean;
  error: string | null;
}

interface UseArticlesReturn extends UseArticlesState {
  fetchArticles: (params?: ArticleListParams) => Promise<void>;
  setPage: (page: number) => void;
}

export function useArticles(initialParams?: ArticleListParams): UseArticlesReturn {
  const [state, setState] = useState<UseArticlesState>({
    articles: [],
    pagination: null,
    isLoading: false,
    error: null,
  });
  const paramsRef = useRef<ArticleListParams>(initialParams || {});

  const fetchArticles = useCallback(
    async (newParams?: ArticleListParams) => {
      const queryParams = newParams !== undefined ? newParams : paramsRef.current;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await api.articles.list({
          page_size: DEFAULT_PAGE_SIZE,
          ...queryParams,
        });

        setState({
          articles: response.items,
          pagination: {
            total: response.total,
            page: response.page,
            page_size: response.page_size,
            total_pages: response.total_pages,
          },
          isLoading: false,
          error: null,
        });

        if (newParams !== undefined) {
          paramsRef.current = newParams;
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to fetch articles',
        }));
      }
    },
    []
  );

  const setPage = useCallback(
    (page: number) => {
      fetchArticles({ ...paramsRef.current, page });
    },
    [fetchArticles]
  );

  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ...state,
    fetchArticles,
    setPage,
  };
}
