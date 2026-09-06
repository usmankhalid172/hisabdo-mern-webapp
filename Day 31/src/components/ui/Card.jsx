'use client';

import React from 'react';

export function Card({ children, className = '', style = {}, borderLeftColor, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${onClick ? 'glass-card-interactive' : ''} ${className}`}
      style={{
        padding: '1.5rem',
        borderLeft: borderLeftColor ? `4px solid ${borderLeftColor}` : undefined,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {Icon && (
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
            <Icon size={20} />
          </div>
        )}
        <div>
          {title && <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white' }}>{title}</h3>}
          {subtitle && <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, style = {} }) {
  return <div style={{ ...style }}>{children}</div>;
}
