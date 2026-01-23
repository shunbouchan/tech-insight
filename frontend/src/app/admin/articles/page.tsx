'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ArticleSummary } from '@/types/article';
import { ArticleListResponse } from '@/types/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    total_pages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ArticleSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArticles = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: ArticleListResponse = await api.articles.list({
        page,
        page_size: DEFAULT_PAGE_SIZE,
      });

      setArticles(response.items);
      setPagination({
        total: response.total,
        page: response.page,
        total_pages: response.total_pages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch articles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await api.articles.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchArticles(pagination?.page || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-full py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">記事管理</h1>
            <p className="text-gray-600">
              {pagination ? `${pagination.total} 件の記事` : '読み込み中...'}
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  タイトル
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  著者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  公開日
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                    記事がありません
                  </td>
                </tr>
              ) : (
                articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge category={article.category} variant="category" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {article.author}
                    </td>
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
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(article)}
                        >
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
              onPageChange={fetchArticles}
            />
          </div>
        )}

        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="記事の削除"
          size="sm"
        >
          <p className="text-gray-600 mb-6">
            「{deleteTarget?.title}」を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              削除
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
