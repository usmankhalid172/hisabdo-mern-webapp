"use client";

import React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type FeedbackType = "success" | "error";

export interface LedgerFeedbackProps {
  type: FeedbackType;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function LedgerFeedback({
  type,
  message,
  onDismiss,
  className = "",
}: LedgerFeedbackProps) {
  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      aria-live={isSuccess ? "polite" : "assertive"}
      className={`flex items-start gap-3 p-4 rounded-card border ${
        isSuccess
          ? "bg-success/10 border-success/30 text-success"
          : "bg-danger/10 border-danger/30 text-danger"
      } ${className}`}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-5 h-5" aria-hidden="true" />
        )}
      </div>

      <p className="flex-1 text-sm font-semibold text-foreground">
        {message}
      </p>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="shrink-0 p-1 rounded-control text-muted-foreground hover:text-foreground hover:bg-surface-muted transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}