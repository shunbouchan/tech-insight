'use client';

import { useState, useCallback } from 'react';
import { Category } from '@/types/article';
import { useArticles } from '@/hooks/useArticles';
import { useSearch } from '@/hooks/useSearch';
import { SearchBar } from '@/components/search/SearchBar';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { ArticleList } from '@/components/articles/ArticleList';
import { ArticleModal } from '@/components/articles/ArticleModal';
import { Pagination } from '@/components/ui/Pagination';

export default function Home() {
  const [category, setCategory] = useState<Category | ''>('');
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
    results: searchResults,
    isLoading: isSearchLoading,
    error: searchError,
    query,
    setQuery,
  } = useSearch(category || undefined);

  const isSearchMode = query.trim().length > 0;
  const displayArticles = isSearchMode ? searchResults : articles;
  const isLoading = isSearchMode ? isSearchLoading : isArticlesLoading;
  const error = isSearchMode ? searchError : articlesError;

  const handleCategoryChange = useCallback(
    (newCategory: Category | '') => {
      setCategory(newCategory);
      if (!isSearchMode) {
        fetchArticles({ category: newCategory || undefined, page: 1 });
      }
    },
    [fetchArticles, isSearchMode]
  );

  const handleArticleClick = useCallback((id: number) => {
    setSelectedArticleId(id);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedArticleId(null);
  }, []);

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <section className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">TechInsight</h1>
          <p className="mb-6 text-gray-600">AI搭載セマンティック検索で技術記事を探索</p>

          <div className="space-y-4">
            <SearchBar value={query} onChange={setQuery} isLoading={isSearchLoading} />
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
              {isSearchMode ? '検索結果' : '記事一覧'}
            </h2>
            {!isSearchMode && pagination && (
              <p className="text-sm text-gray-500">{pagination.total} 件の記事</p>
            )}
            {isSearchMode && (
              <p className="text-sm text-gray-500">{searchResults.length} 件の結果</p>
            )}
          </div>

          <ArticleList
            articles={displayArticles}
            isLoading={isLoading}
            onArticleClick={handleArticleClick}
            emptyMessage={
              isSearchMode
                ? '検索クエリに一致する記事が見つかりませんでした'
                : '記事が見つかりませんでした'
            }
          />

          {!isSearchMode && pagination && pagination.total_pages > 1 && (
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
