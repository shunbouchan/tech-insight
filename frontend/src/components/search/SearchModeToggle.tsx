'use client';

import { SearchMode, SEARCH_MODES, SEARCH_MODE_LABELS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface SearchModeToggleProps {
  value: SearchMode;
  onChange: (mode: SearchMode) => void;
  className?: string;
}

export function SearchModeToggle({ value, onChange, className }: SearchModeToggleProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
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
    </div>
  );
}
