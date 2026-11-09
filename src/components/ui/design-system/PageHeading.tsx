
import type { ReactNode } from 'react';

type PageHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function PageHeading({
  title,
  description,
  action,
  className = '',
}: PageHeadingProps) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {title}
        </h1>

        {description && (
          <p className="text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
