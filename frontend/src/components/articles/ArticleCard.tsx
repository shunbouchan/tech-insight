'use client';

import { ArticleSummary, SearchResult } from '@/types/article';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HighlightedText } from '@/components/search/HighlightedText';
import { formatDate, formatSimilarity } from '@/lib/utils';

interface ArticleCardProps {
  article: ArticleSummary | SearchResult;
  query?: string;
  onClick?: () => void;
}

function isSearchResult(article: ArticleSummary | SearchResult): article is SearchResult {
  return 'similarity' in article;
}

export function ArticleCard({ article, query = '', onClick }: ArticleCardProps) {
  const searchResult = isSearchResult(article) ? article : null;
  const similarity = searchResult?.similarity ?? null;
  const highlight = article.highlight ?? null;

  return (
    <Card hover onClick={onClick} className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2">
          <Badge category={article.category} variant="category" />
          {similarity !== null && (
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${similarity * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{formatSimilarity(similarity)}</span>
            </div>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">{article.title}</h3>

        {highlight ? (
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">
            <HighlightedText text={highlight} query={query} />
          </p>
        ) : (
          <p className="mb-4 line-clamp-3 flex-1 text-sm text-gray-600">{article.excerpt}</p>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm text-gray-500">
          <span>{article.author}</span>
          <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
        </div>
      </CardContent>
    </Card>
  );
}
