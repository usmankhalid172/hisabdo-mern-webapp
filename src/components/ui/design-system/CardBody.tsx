
import type { HTMLAttributes } from 'react';

type CardBodyProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'compact' | 'spacious';
};

export function CardBody({
  children,
  className = '',
  variant = 'default',
  ...props
}: CardBodyProps) {
  const variantStyles = {
    default: 'p-4',
    compact: 'p-2',
    spacious: 'p-6',
  };

  return (
    <div
      className={`${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
