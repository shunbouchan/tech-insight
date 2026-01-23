'use client';

import { Category } from '@/types/article';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  value: Category | '';
  onChange: (category: Category | '') => void;
  className?: string;
}

export function CategoryFilter({
  value,
  onChange,
  className,
}: CategoryFilterProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      <button
        onClick={() => onChange('')}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
          value === ''
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        )}
      >
        All
      </button>
      {CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
            value === category
              ? CATEGORY_COLORS[category]
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
