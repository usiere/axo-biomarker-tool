'use client';

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export default function HighlightText({ text, highlight, className = '' }: HighlightTextProps) {
  if (!highlight || !text) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-ink font-medium px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}