'use client';

import { ArticleSummary, SearchResult } from '@/types/article';
import { ArticleCard } from './ArticleCard';
import { ArticleListSkeleton } from '@/components/ui/Skeleton';

interface ArticleListProps {
  articles: (ArticleSummary | SearchResult)[];
  isLoading?: boolean;
  query?: string;
  onArticleClick?: (id: number) => void;
  emptyMessage?: string;
}

export function ArticleList({
  articles,
  isLoading = false,
  query,
  onArticleClick,
  emptyMessage = '記事が見つかりませんでした',
}: ArticleListProps) {
  if (isLoading) {
    return <ArticleListSkeleton />;
  }

  if (articles.length === 0) {
    return (
      <div className="py-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-4 text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          query={query}
          onClick={() => onArticleClick?.(article.id)}
        />
      ))}
    </div>
  );
}
