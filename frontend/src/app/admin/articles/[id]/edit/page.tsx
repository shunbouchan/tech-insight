'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Article, ArticleCreateInput } from '@/types/article';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const articleId = parseInt(resolvedParams.id, 10);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await api.articles.get(articleId);
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch article');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [articleId]);

  const handleSubmit = async (data: ArticleCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.articles.update(articleId, data);
      router.push('/admin/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update article');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/articles');
  };

  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">記事の編集</h1>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">記事情報</h2>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-6">
                <div>
                  <Skeleton variant="text" className="mb-1 h-5 w-20" />
                  <Skeleton variant="rectangular" className="h-10 w-full rounded" />
                </div>
                <div>
                  <Skeleton variant="text" className="mb-1 h-5 w-16" />
                  <Skeleton variant="rectangular" className="h-40 w-full rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Skeleton variant="text" className="mb-1 h-5 w-16" />
                    <Skeleton variant="rectangular" className="h-10 w-full rounded" />
                  </div>
                  <div>
                    <Skeleton variant="text" className="mb-1 h-5 w-20" />
                    <Skeleton variant="rectangular" className="h-10 w-full rounded" />
                  </div>
                </div>
              </div>
            ) : article ? (
              <ArticleForm
                article={article}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            ) : (
              <p className="py-8 text-center text-gray-600">記事が見つかりませんでした</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
