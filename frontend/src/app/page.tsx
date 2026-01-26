'use client';

import { useState, useCallback } from 'react';
import { Category } from '@/types/article';
import { SearchMode } from '@/lib/constants';
import { useArticles } from '@/hooks/useArticles';
import { useSearch } from '@/hooks/useSearch';
import { useKeywordSearch } from '@/hooks/useKeywordSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchModeToggle } from '@/components/search/SearchModeToggle';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleModal } from '@/components/articles/ArticleModal';
import { Pagination } from '@/components/ui/Pagination';

export default function Home() {
  const [category, setCategory] = useState<Category | ''>('');
  const [searchMode, setSearchMode] = useState<SearchMode>('semantic');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    articles,
    pagination,
    isLoading: isArticlesLoading,
    error: articlesError,
    fetchArticles,
    setPage,
  } = useArticles();

  const {
    results: semanticResults,
    isLoading: isSemanticLoading,
    error: semanticError,
    query: semanticQuery,
    setQuery: setSemanticQuery,
  } = useSearch(category || undefined);

  const {
    results: keywordResults,
    isLoading: isKeywordLoading,
    error: keywordError,
    query: keywordQuery,
    setQuery: setKeywordQuery,
  } = useKeywordSearch(category || undefined);

  const activeQuery = searchMode === 'semantic' ? semanticQuery : keywordQuery;
  const setActiveQuery = searchMode === 'semantic' ? setSemanticQuery : setKeywordQuery;
  const isSearchActive = activeQuery.trim().length > 0;

  const displayArticles = isSearchActive
    ? searchMode === 'semantic'
      ? semanticResults
      : keywordResults
    : articles;
  const isLoading = isSearchActive
    ? searchMode === 'semantic'
      ? isSemanticLoading
      : isKeywordLoading
    : isArticlesLoading;
  const error = isSearchActive
    ? searchMode === 'semantic'
      ? semanticError
      : keywordError
    : articlesError;

  const handleSearchModeChange = useCallback(
    (newMode: SearchMode) => {
      if (newMode === searchMode) return;

      const currentQuery = searchMode === 'semantic' ? semanticQuery : keywordQuery;

      if (newMode === 'semantic') {
        setSemanticQuery(currentQuery);
        setKeywordQuery('');
      } else {
        setKeywordQuery(currentQuery);
        setSemanticQuery('');
      }

      setSearchMode(newMode);
    },
    [searchMode, semanticQuery, keywordQuery, setSemanticQuery, setKeywordQuery]
  );

  const handleCategoryChange = useCallback(
    (newCategory: Category | '') => {
      setCategory(newCategory);
      if (!isSearchActive) {
        fetchArticles({ category: newCategory || undefined, page: 1 });
      }
    },
    [fetchArticles, isSearchActive]
  );

  const handleArticleClick = useCallback((id: number) => {
    setSelectedArticleId(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedArticleId(null);
  }, []);

  const resultCount = isSearchActive
    ? searchMode === 'semantic'
      ? semanticResults.length
      : keywordResults.length
    : null;

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <section className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">TechInsight</h1>
          <p className="mb-6 text-gray-600">AI搭載セマンティック検索で技術記事を探索</p>

          <div className="space-y-4">
            <SearchModeToggle value={searchMode} onChange={handleSearchModeChange} />
            <SearchBar
              value={activeQuery}
              onChange={setActiveQuery}
              searchMode={searchMode}
              isLoading={isLoading && isSearchActive}
            />
            <CategoryFilter value={category} onChange={handleCategoryChange} />
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isSearchActive ? '検索結果' : '記事一覧'}
            </h2>
            {!isSearchActive && pagination && (
              <p className="text-sm text-gray-500">{pagination.total} 件の記事</p>
            )}
            {isSearchActive && resultCount !== null && (
              <p className="text-sm text-gray-500">{resultCount} 件の結果</p>
            )}
          </div>

          <ArticleList
            articles={displayArticles}
            isLoading={isLoading}
            onArticleClick={handleArticleClick}
            emptyMessage={
              isSearchActive
                ? '検索クエリに一致する記事が見つかりませんでした'
                : '記事が見つかりませんでした'
            }
          />

          {!isSearchActive && pagination && pagination.total_pages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </section>

        <ArticleModal
          articleId={selectedArticleId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
}
