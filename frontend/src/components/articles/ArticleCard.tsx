'use client';

import { ArticleSummary, SearchResult } from '@/types/article';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, formatSimilarity } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleSummary | SearchResult;
  onClick?: () => void;
}

function isSearchResult(
  article: ArticleSummary | SearchResult
): article is SearchResult {
  return 'similarity' in article;
}

export function ArticleCard({ article, onClick }: ArticleCardProps) {
  const similarity = isSearchResult(article) ? article.similarity : null;

  return (
    <Card hover onClick={onClick} className="h-full flex flex-col">
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Badge category={article.category} variant="category" />
          {similarity !== null && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {formatSimilarity(similarity)} match
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <span>{article.author}</span>
          <time dateTime={article.published_at}>
            {formatDate(article.published_at)}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}
