export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} TechInsight. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            AI搭載型ナレッジベース - セマンティック検索で技術記事を探索
          </p>
        </div>
      </div>
    </footer>
  );
}
