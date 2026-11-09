
import type { HTMLAttributes } from 'react';

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'borderless';
};

export function CardHeader({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardHeaderProps) {
  const variantStyles = {
    default: 'border-b border-[var(--border-color)]',
    borderless: '',
  };

  return (
    <div
      className={`p-4 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
