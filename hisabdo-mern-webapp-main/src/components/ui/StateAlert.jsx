'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Inbox, X, CheckCircle2 } from 'lucide-react';
import Button from './Button';

export function LoadingState({ message = 'Loading records...' }) {
  return (
    <div style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }} className="animate-pulse">
      <RefreshCw size={32} color="#3b82f6" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
      <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>{message}</div>
      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Communicating with database...</div>
    </div>
  );
}

export function EmptyState({ title = 'No Data Found', message = 'No records match your criteria.', actionText, onAction }) {
  return (
    <div style={{
      padding: '3.5rem 1.5rem',
      textAlign: 'center',
      background: 'rgba(15, 23, 42, 0.4)',
      borderRadius: '12px',
      border: '1px dashed rgba(255, 255, 255, 0.12)'
    }}>
      <Inbox size={44} color="#475569" style={{ margin: '0 auto 1rem' }} />
      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>{title}</h4>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto 1.25rem' }}>{message}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({ title = 'Alert', message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      background: 'rgba(239, 68, 68, 0.15)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#f87171'
    }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertTriangle size={20} color="#f87171" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
          <div style={{ fontSize: '0.85rem', color: '#fca5a5' }}>{message}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '0.25rem' }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function SuccessBanner({ title = 'Success', message, onDismiss }) {
  if (!message) return null;

  return (
    <div style={{
      background: 'rgba(16, 185, 129, 0.15)',
      border: '1px solid rgba(16, 185, 129, 0.4)',
      padding: '1rem 1.25rem',
      borderRadius: '12px',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      color: '#34d399'
    }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{title}</div>
          <div style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>{message}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'transparent', border: 'none', color: '#a7f3d0', cursor: 'pointer', padding: '0.25rem' }}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
