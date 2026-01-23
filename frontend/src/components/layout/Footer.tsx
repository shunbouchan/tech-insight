export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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
