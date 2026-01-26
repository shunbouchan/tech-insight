'use client';

import { SearchMode, SEARCH_MODES, SEARCH_MODE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Popover } from '@/components/ui/Popover';

interface SearchModeToggleProps {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
}

export function SearchModeToggle({ value, onChange, className }: SearchModeToggleProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {SEARCH_MODES.map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            value === mode
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {SEARCH_MODE_LABELS[mode]}
        </button>
      ))}

      <Popover
        trigger={
          <span className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>検索モードの使い分け</span>
          </span>
        }
        className="w-[28rem] max-w-[calc(100vw-2rem)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">キーワード検索</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>タイトル・本文の文字列を直接検索</li>
              <li>特定の用語やエラーメッセージの検索に最適</li>
              <li>例: 「Docker」「useEffect」「SQL injection」</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold text-gray-900">セマンティック検索</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>AIが意味を理解して関連記事を検索</li>
              <li>概念的な質問や曖昧な検索に最適</li>
              <li>例: 「バックエンドの設計パターン」「パフォーマンス改善」</li>
            </ul>
          </div>
        </div>
      </Popover>
    </div>
  );
}
