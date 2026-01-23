import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Category } from '@/types/article';
import { CATEGORY_COLORS } from '@/lib/constants';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  category?: Category;
  variant?: 'default' | 'category';
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, category, variant = 'default', children, ...props }, ref) => {
    const colorClass =
      variant === 'category' && category ? CATEGORY_COLORS[category] : 'bg-gray-100 text-gray-800';

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          colorClass,
          className
        )}
        {...props}
      >
        {children || category}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
