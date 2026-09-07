'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  style = {}
}) {
  const sizeStyles = {
    sm: { padding: '0.45rem 0.9rem', fontSize: '0.8rem', borderRadius: '8px' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.95rem', borderRadius: '10px' },
    lg: { padding: '1rem 2rem', fontSize: '1.05rem', borderRadius: '12px' }
  };

  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass} ${className}`}
      style={{
        ...sizeStyles[size],
        opacity: (disabled || loading) ? 0.6 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...style
      }}
    >
      {loading ? (
        <RefreshCw size={size === 'sm' ? 14 : 18} className="animate-spin" />
      ) : Icon ? (
        <Icon size={size === 'sm' ? 14 : 18} />
      ) : null}
      {children}
    </button>
  );
}
