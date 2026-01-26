'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArticleSummary, Category } from '@/types/article';
import { formatDate } from '@/lib/utils';
import { SEARCH_DEBOUNCE_MS } from '@/lib/constants';
import { useArticles } from '@/hooks/useArticles';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchBar } from '@/components/search/SearchBar';
import { CategoryFilter } from '@/components/search/CategoryFilter';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminArticlesPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const debouncedKeyword = useDebounce(keyword, SEARCH_DEBOUNCE_MS);

  const { articles, pagination, isLoading, error, fetchArticles } = useArticles({
    skipInitialFetch: true,
  });

  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const [deleteTarget, setDeleteTarget] = useState<ArticleSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const currentFilters = {
    keyword: debouncedKeyword || undefined,
    category: category || undefined,
    sort_order: sortOrder,
  };

  useEffect(() => {
    fetchArticles(currentFilters);
  }, [debouncedKeyword, category, sortOrder, fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.articles.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchArticles({
        page: pagination?.page || 1,
        ...currentFilters,
      });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilter = !!debouncedKeyword || !!category;

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">記事管理</h1>
            <p className="text-gray-600">
              {pagination
                ? hasFilter
                  ? `${pagination.total} 件の検索結果`
                  : `${pagination.total} 件の記事`
                : '読み込み中...'}
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button>
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              新規作成
            </Button>
          </Link>
        </div>

        <div className="mb-6 space-y-4">
          <SearchBar
            value={keyword}
            onChange={setKeyword}
            placeholder="キーワードで記事を検索..."
            isLoading={isLoading && !!debouncedKeyword}
          />
          <CategoryFilter value={category} onChange={setCategory} />
        </div>

        {(error || deleteError) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error || deleteError}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  著者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    className="inline-flex items-center gap-1 hover:text-gray-700"
                  >
                    公開日
                    {sortOrder === 'desc' ? '↓' : '↑'}
                  </button>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" className="h-5 w-64" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="rectangular" className="h-6 w-16 rounded-full" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" className="h-5 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton variant="text" className="h-5 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton variant="rectangular" className="h-8 w-16 rounded" />
                        <Skeleton variant="rectangular" className="h-8 w-16 rounded" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {hasFilter ? '条件に一致する記事がありません' : '記事がありません'}
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="line-clamp-1 text-sm font-medium text-gray-900">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge category={article.category} variant="category" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{article.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(article.published_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            編集
                          </Button>
                        </Link>
                        <Button variant="danger" size="sm" onClick={() => setDeleteTarget(article)}>
                          削除
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.total_pages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              onPageChange={(page) =>
                fetchArticles({
                  page,
                  ...currentFilters,
                })
              }
            />
          </div>
        )}

        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="記事の削除"
          size="sm"
        >
          <p className="mb-6 text-gray-600">
            「{deleteTarget?.title}」を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              削除
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
