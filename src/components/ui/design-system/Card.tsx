
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-card border border-[var(--border-color)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
