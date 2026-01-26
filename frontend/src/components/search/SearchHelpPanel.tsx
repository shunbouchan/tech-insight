'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SearchHelpPanel({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>検索モードの使い分け</span>
        <svg
          className={cn('h-4 w-4 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">キーワード検索</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>タイトル・本文の文字列を直接検索</li>
                <li>特定の用語やエラーメッセージの検索に最適</li>
                <li>例: 「Docker」「useEffect」「SQL injection」</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">セマンティック検索</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>AIが意味を理解して関連記事を検索</li>
                <li>概念的な質問や曖昧な検索に最適</li>
                <li>例: 「バックエンドの設計パターン」「パフォーマンス改善」</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
