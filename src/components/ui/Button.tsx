'use client';

import React from 'react';
import { RefreshCw, type LucideIcon } from 'lucide-react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'amber'
  | 'danger'
  | 'success';

type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'ps-3 pe-3 py-1.5 text-xs rounded-control',
  md: 'ps-4 pe-4 py-2.5 text-sm rounded-control',
  lg: 'ps-6 pe-6 py-3 text-base rounded-control',
};

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 18, lg: 20 };

const spinnerSizes: Record<ButtonSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover shadow-card',
  secondary:
    'bg-surface-muted text-primary border border-primary/20 hover:bg-surface-raised',
  accent: 'bg-success text-white hover:opacity-90 shadow-card',
  amber: 'bg-warning text-white hover:opacity-90 shadow-card',
  danger: 'bg-danger text-white hover:opacity-90 shadow-card',
  success: 'bg-success text-white hover:opacity-90 shadow-card',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  style = {},
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {loading ? (
        <RefreshCw
          className={`animate-spin ${spinnerSizes[size]}`}
          aria-hidden="true"
        />
      ) : Icon ? (
        <Icon size={iconSizes[size]} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;