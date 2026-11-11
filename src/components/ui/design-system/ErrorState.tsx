import type { ReactNode } from 'react';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  action,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 p-8 text-center ${className}`}
    >
      <h3 className="text-lg font-semibold text-danger">
        {title}
      </h3>

      <p className="max-w-md text-sm text-secondary">
        {message}
      </p>

      {action}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary rounded-control px-4 py-2 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}