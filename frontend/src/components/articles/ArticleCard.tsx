'use client';

import { ArticleSummary, SearchResult } from '@/types/article';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatSimilarity } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleSummary | SearchResult;
  onClick?: () => void;
}

function isSearchResult(article: ArticleSummary | SearchResult): article is SearchResult {
  return 'similarity' in article;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const similarity = isSearchResult(article) ? article.similarity : null;

  return (
    <Card hover onClick={onClick} className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2">
          <Badge category={article.category} variant="category" />
          {similarity !== null && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              {formatSimilarity(similarity)} match
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">{article.title}</h3>

        <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">{article.excerpt}</p>

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500">
          <span>{article.author}</span>
          <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
        </div>
      </CardContent>
    </Card>
  );
}
