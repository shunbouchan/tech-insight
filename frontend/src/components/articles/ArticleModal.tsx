'use client';

import { useState, useEffect } from 'react';
import { Article } from '@/types/article';
import { api } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDateTime } from '@/lib/utils';

interface ArticleModalProps {
  articleId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleModal({ articleId, isOpen, onClose }: ArticleModalProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (articleId && isOpen) {
      setIsLoading(true);
      setError(null);

      api.articles
        .get(articleId)
        .then((data) => {
          setArticle(data);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to load article');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setArticle(null);
    }
  }, [articleId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton variant="text" className="h-8 w-3/4" />
          <div className="flex gap-2">
            <Skeleton variant="rectangular" width={60} height={24} />
            <Skeleton variant="text" width={100} />
          </div>
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="80%" />
        </div>
      )}

      {error && (
        <div className="py-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-4 text-red-600">{error}</p>
        </div>
      )}

      {article && !isLoading && (
        <article>
          <header className="mb-6">
            <h1 className="mb-3 text-2xl font-bold text-gray-900">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <Badge category={article.category} variant="category" />
              <span>by {article.author}</span>
              <span>|</span>
              <time dateTime={article.published_at}>{formatDateTime(article.published_at)}</time>
            </div>
          </header>

          <div className="prose prose-gray max-w-none">
            {article.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>

          <footer className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
            <p>Created: {formatDateTime(article.created_at)}</p>
            <p>Last updated: {formatDateTime(article.updated_at)}</p>
          </footer>
        </article>
      )}
    </Modal>
  );
}
