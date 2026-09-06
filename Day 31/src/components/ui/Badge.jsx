'use client';

import React from 'react';

export default function Badge({ children, variant = 'blue', style = {} }) {
  const badgeClasses = {
    blue: 'badge-blue',
    green: 'badge-green',
    purple: 'badge-purple',
    amber: 'badge-amber',
    red: { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 },
    slate: { background: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', border: '1px solid rgba(148, 163, 184, 0.3)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }
  };

  if (typeof badgeClasses[variant] === 'object') {
    return <span style={{ ...badgeClasses[variant], display: 'inline-flex', alignItems: 'center', gap: '0.35rem', ...style }}>{children}</span>;
  }

  return <span className={badgeClasses[variant]} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', ...style }}>{children}</span>;
}
