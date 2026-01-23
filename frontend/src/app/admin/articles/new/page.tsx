'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { ArticleCreateInput } from '@/types/article';
import { ArticleForm } from '@/components/articles/ArticleForm';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: ArticleCreateInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await api.articles.create(data);
      router.push('/admin/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/articles');
  };

  return (
    <div className="bg-gray-50 min-h-full py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">記事の新規作成</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">記事情報</h2>
          </CardHeader>
          <CardContent>
            <ArticleForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
