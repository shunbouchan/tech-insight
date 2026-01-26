'use client';

import { SearchMode, SEARCH_MODE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SearchEmptyStateProps {
  query: string;
  searchMode: SearchMode;
  onSwitchMode: () => void;
  className?: string;
}

const SEARCH_TIPS: Record<SearchMode, string[]> = {
  keyword: [
    'スペース区切りではなく、1つのキーワードで検索してみてください',
    'より一般的な用語に変えてみてください',
    'セマンティック検索なら意味的に近い記事も見つかります',
  ],
  semantic: [
    'より具体的なフレーズで検索してみてください',
    '質問形式で入力すると効果的です（例: 「Dockerの使い方」）',
    'キーワード検索なら完全一致で確実にヒットします',
  ],
};

export function SearchEmptyState({
  query,
  searchMode,
  onSwitchMode,
  className,
}: SearchEmptyStateProps) {
  const alternativeMode: SearchMode = searchMode === 'semantic' ? 'keyword' : 'semantic';

  return (
    <div className={cn('py-12 text-center', className)}>
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
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <p className="mt-4 text-gray-900 font-medium">
        「{query}」に一致する記事が見つかりませんでした
      </p>

      <div className="mt-6 text-left mx-auto max-w-md">
        <p className="text-sm font-medium text-gray-700 mb-2">検索のコツ</p>
        <ul className="space-y-1">
          {SEARCH_TIPS[searchMode].map((tip, i) => (
            <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
              <span className="mt-1 block h-1 w-1 flex-shrink-0 rounded-full bg-gray-400" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onSwitchMode}
        className="mt-6 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
      >
        {SEARCH_MODE_LABELS[alternativeMode]}で試す
      </button>
    </div>
  );
}
