'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="bg-gray-50 min-h-full flex items-center justify-center py-16">
      <div className="text-center max-w-md px-4">
        <svg
          className="mx-auto h-16 w-16 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h1 className="mt-6 text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h1>

        <p className="mt-4 text-gray-600">
          申し訳ございません。予期しないエラーが発生しました。
          ページを再読み込みするか、しばらく経ってからもう一度お試しください。
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={reset}>再試行</Button>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            ホームに戻る
          </Button>
        </div>

        {error.digest && (
          <p className="mt-8 text-xs text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
