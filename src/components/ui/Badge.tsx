'use client';

import React from 'react';

type BadgeVariant =
  | 'blue'
  | 'green'
  | 'purple'
  | 'amber'
  | 'red'
  | 'slate'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  style?: React.CSSProperties;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: 'bg-info/10 text-info border border-info/30',
  info: 'bg-info/10 text-info border border-info/30',
  green: 'bg-success/10 text-success border border-success/30',
  success: 'bg-success/10 text-success border border-success/30',
  purple: 'bg-primary/10 text-primary border border-primary/30',
  amber: 'bg-warning/10 text-warning border border-warning/30',
  warning: 'bg-warning/10 text-warning border border-warning/30',
  red: 'bg-danger/10 text-danger border border-danger/30',
  danger: 'bg-danger/10 text-danger border border-danger/30',
  slate: 'bg-primary/5 text-primary/70 border border-primary/20',
  neutral: 'bg-primary/5 text-primary/70 border border-primary/20',
};

export function Badge({
  children,
  variant = 'blue',
  className = '',
  style = {},
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

export default Badge;