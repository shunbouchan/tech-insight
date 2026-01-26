'use client';

import { useMemo } from 'react';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

export function HighlightedText({ text, query, className }: HighlightedTextProps) {
  const parts = useMemo(() => {
    if (!query.trim()) {
      return [{ text, highlight: false }];
    }

    // Split query into terms (2+ chars) and escape for regex
    const terms = query
      .split(/\s+/)
      .filter((t) => t.length >= 2)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    if (terms.length === 0) {
      return [{ text, highlight: false }];
    }

    const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
    const segments: { text: string; highlight: boolean }[] = [];
    let lastIndex = 0;

    text.replace(pattern, (match, _group, offset) => {
      if (offset > lastIndex) {
        segments.push({ text: text.slice(lastIndex, offset), highlight: false });
      }
      segments.push({ text: match, highlight: true });
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), highlight: false });
    }

    return segments;
  }, [text, query]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark key={i} className="rounded bg-yellow-200 px-0.5 text-gray-900">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </span>
  );
}
