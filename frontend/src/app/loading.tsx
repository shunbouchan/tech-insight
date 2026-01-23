import { ArticleListSkeleton } from '@/components/ui/Skeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-full bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <section className="mb-8">
          <Skeleton variant="text" className="mb-2 h-9 w-48" />
          <Skeleton variant="text" className="mb-6 h-5 w-72" />

          <div className="space-y-4">
            <Skeleton variant="rectangular" className="h-12 w-full rounded-lg" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton variant="text" className="h-7 w-32" />
            <Skeleton variant="text" className="h-5 w-24" />
          </div>

          <ArticleListSkeleton count={6} />
        </section>
      </div>
    </div>
  );
}
