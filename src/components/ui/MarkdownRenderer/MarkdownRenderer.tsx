import type { JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps): JSX.Element {
  // API sends literal \n strings — convert to real newlines before parsing
  const normalized = content.replace(/\\n/g, '\n');

  return (
    <div
      className={clsx(
        'prose prose-sm max-w-none',
        '[--tw-prose-body:var(--color-text)]',
        '[--tw-prose-headings:var(--color-text)]',
        '[--tw-prose-bold:var(--color-text)]',
        '[--tw-prose-bullets:var(--color-text-muted)]',
        '[--tw-prose-counters:var(--color-text-muted)]',
        '[--tw-prose-hr:var(--color-border)]',
        '[--tw-prose-quotes:var(--color-text-muted)]',
        '[--tw-prose-links:var(--color-primary)]',
        className
      )}
    >
      <ReactMarkdown>{normalized}</ReactMarkdown>
    </div>
  );
}
