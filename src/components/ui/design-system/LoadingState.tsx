
type LoadingStateProps = {
  message?: string;
  variant?: 'spinner' | 'skeleton';
  className?: string;
};

export function LoadingState({
  message = 'Loading...',
  variant = 'spinner',
  className = '',
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    return (
      <div
        role="status"
        aria-label={message}
        className={`animate-pulse space-y-3 p-6 ${className}`}
      >
        <div className="h-5 w-1/3 rounded-control bg-surface-muted" />
        <div className="h-4 w-full rounded-control bg-surface-muted" />
        <div className="h-4 w-2/3 rounded-control bg-surface-muted" />
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 p-6 ${className}`}
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[rgb(var(--primary))]"
      />

      <p className="text-sm text-[var(--text-secondary)]">
        {message}
      </p>
    </div>
  );
}
