"use client";

import React, { useEffect, useRef } from "react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  className?: string;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  footerActions,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className={`w-full max-w-md overflow-hidden bg-surface shadow-card rounded-card border border-border ${className}`}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-4 text-sm text-foreground">
          {children}
        </div>
        {footerActions && (
          <div className="flex justify-end gap-3 border-t border-border bg-background/50 px-6 py-4">
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
}