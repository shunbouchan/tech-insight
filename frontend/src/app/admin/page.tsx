'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';

export default function AdminPage() {
  return (
    <div className="bg-gray-50 min-h-full py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理画面</h1>
        <p className="text-gray-600 mb-8">TechInsightの記事を管理します</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/articles">
            <Card hover className="h-full">
              <CardContent className="flex flex-col items-center text-center py-8">
                <svg
                  className="w-12 h-12 text-blue-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  記事管理
                </h2>
                <p className="text-gray-600">
                  記事の一覧表示、作成、編集、削除を行います
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
