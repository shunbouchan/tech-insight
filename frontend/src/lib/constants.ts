import { Category } from '@/types/article';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const CATEGORIES: Category[] = ['AI/ML', 'Backend', 'Frontend', 'DevOps'];

export const CATEGORY_COLORS: Record<Category, string> = {
  'AI/ML': 'bg-purple-100 text-purple-800',
  Backend: 'bg-green-100 text-green-800',
  Frontend: 'bg-blue-100 text-blue-800',
  DevOps: 'bg-orange-100 text-orange-800',
};

export const DEFAULT_PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;

export type SearchMode = 'keyword' | 'semantic';

export const SEARCH_MODES: SearchMode[] = ['keyword', 'semantic'];

export const SEARCH_MODE_LABELS: Record<SearchMode, string> = {
  keyword: 'キーワード検索',
  semantic: 'セマンティック検索',
};

export const SEARCH_MODE_TOOLTIPS: Record<SearchMode, string> = {
  keyword: 'タイトル・本文のキーワードで検索',
  semantic: 'AI埋め込みによる意味的な類似検索',
};

export const SEARCH_MODE_PLACEHOLDERS: Record<SearchMode, string> = {
  keyword: 'キーワードで記事を検索...',
  semantic: '自然言語で記事を検索...',
};
