import type { HTMLAttributes } from 'react';

type CardHeaderProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'borderless';
};

export function CardHeader({
  children,
  className = '',
  variant = 'default',
  style,
  ...props
}: CardHeaderProps) {
  const variantStyles = {
    default: 'border-b border-primary/20',
    borderless: '',
  };

  return (
    <div
      className={`p-4 ${variantStyles[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}