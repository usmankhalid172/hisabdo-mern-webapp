
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`hisab-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
