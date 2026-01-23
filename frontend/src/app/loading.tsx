import { ArticleListSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="bg-gray-50 min-h-full py-8">
      <div className="container mx-auto px-4">
        <section className="mb-8">
          <Skeleton variant="text" className="h-9 w-48 mb-2" />
          <Skeleton variant="text" className="h-5 w-72 mb-6" />

          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  className="h-8 w-20 rounded-full"
                />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="text" className="h-7 w-32" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>

          <ArticleListSkeleton count={6} />
        </section>
      </div>
    </div>
  );
}
