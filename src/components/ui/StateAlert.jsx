'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Inbox, X, CheckCircle2 } from 'lucide-react';
import Button from './Button';

export function LoadingState({ message = 'Loading records...' }) {
  return (
    <div className="animate-pulse rounded-card border border-border bg-surface-raised px-6 py-12 text-center shadow-card">
      <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-info" />
      <div className="text-base font-semibold text-foreground">{message}</div>
      <div className="mt-1 text-xs text-muted-foreground">Communicating with database...</div>
    </div>
  );
}

export function EmptyState({ title = 'No Data Found', message = 'No records match your criteria.', actionText, onAction }) {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface-raised px-6 py-14 text-center">
      <Inbox size={44} className="mx-auto mb-4 text-muted-foreground" />
      <h4 className="mb-1.5 text-lg font-bold text-foreground">{title}</h4>
      <p className="mx-auto mb-5 max-w-[380px] text-sm text-muted-foreground">{message}</p>
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
    <div className="animate-fade-in mb-5 flex items-center justify-between rounded-card border border-danger/30 bg-danger/10 px-5 py-4 text-danger">
      <div className="flex items-center gap-3">
        <AlertTriangle size={20} className="shrink-0" />
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-sm text-danger/80">{message}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="cursor-pointer border-none bg-transparent p-1 text-danger/80"
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
    <div className="animate-fade-in mb-5 flex items-center justify-between rounded-card border border-success/30 bg-success/10 px-5 py-4 text-success">
      <div className="flex items-center gap-3">
        <CheckCircle2 size={20} className="shrink-0" />
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-sm text-success/80">{message}</div>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="cursor-pointer border-none bg-transparent p-1 text-success/80"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
