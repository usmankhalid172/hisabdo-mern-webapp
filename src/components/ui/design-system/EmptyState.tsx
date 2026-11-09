
import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  message?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
    >
      <div
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-[var(--text-secondary)]"
      >
        <span className="text-2xl">∅</span>
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h3>

      {message && (
        <p className="max-w-md text-sm text-[var(--text-secondary)]">
          {message}
        </p>
      )}

      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
