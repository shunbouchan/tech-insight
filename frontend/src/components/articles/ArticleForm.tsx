'use client';

import { useState, FormEvent } from 'react';
import { Article, ArticleCreateInput, Category } from '@/types/article';
import { CATEGORIES } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface ArticleFormProps {
  article?: Article;
  onSubmit: (data: ArticleCreateInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ArticleForm({
  article,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [author, setAuthor] = useState(article?.author || '');
  const [category, setCategory] = useState<Category>(article?.category || 'Backend');
  const [publishedAt, setPublishedAt] = useState(
    article?.published_at
      ? new Date(article.published_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (title.length > 500) {
      newErrors.title = 'タイトルは500文字以内で入力してください';
    }

    if (!content.trim()) {
      newErrors.content = '本文は必須です';
    }

    if (!author.trim()) {
      newErrors.author = '著者名は必須です';
    } else if (author.length > 100) {
      newErrors.author = '著者名は100文字以内で入力してください';
    }

    if (!publishedAt) {
      newErrors.publishedAt = '公開日時は必須です';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const data: ArticleCreateInput = {
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category,
      published_at: new Date(publishedAt).toISOString(),
    };

    await onSubmit(data);
  };

  const categoryOptions = CATEGORIES.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="記事のタイトルを入力"
        disabled={isSubmitting}
        required
      />

      <Textarea
        label="本文"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        error={errors.content}
        placeholder="記事の本文を入力"
        disabled={isSubmitting}
        rows={10}
        required
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="著者"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          error={errors.author}
          placeholder="著者名を入力"
          disabled={isSubmitting}
          required
        />

        <Select
          label="カテゴリ"
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          options={categoryOptions}
          disabled={isSubmitting}
          required
        />
      </div>

      <Input
        label="公開日時"
        type="datetime-local"
        value={publishedAt}
        onChange={(e) => setPublishedAt(e.target.value)}
        error={errors.publishedAt}
        disabled={isSubmitting}
        required
      />

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          キャンセル
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {article ? '更新' : '作成'}
        </Button>
      </div>
    </form>
  );
}
