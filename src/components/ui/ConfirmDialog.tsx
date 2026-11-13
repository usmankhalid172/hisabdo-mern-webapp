"use client";

import React from "react";
import Dialog from "./Dialog";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  className?: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  isLoading = false,
  confirmText = "Confirm",
  cancelText = "Cancel",
  className = "",
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={className}
      footerActions={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-card border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-background focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center justify-center rounded-card bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-danger disabled:opacity-50"
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}