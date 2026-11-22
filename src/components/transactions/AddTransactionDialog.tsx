"use client";

import React, { useState } from "react";
import Dialog from "@/components/ui/Dialog";
import { AddIncomeForm } from "@/components/transactions/AddIncomeForm";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  customerId?: string;
  onSuccess?: () => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  type,
  customerId,
  onSuccess,
}: AddTransactionDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    setError(null);
    onOpenChange(false); // Close on success
    if (onSuccess) onSuccess();
  };

  const handleCancel = () => {
    setError(null);
    onOpenChange(false);
  };

  const title = type === "income" ? "Add Income" : "Add Expense";

  return (
    <Dialog isOpen={open} onClose={() => onOpenChange(false)} title={title}>
      {/* Error Message Display */}
      {error && (
        <div className="p-3 mb-4 text-sm text-danger bg-danger/10 rounded-control border border-danger/20">
          {error}
        </div>
      )}

      {/* Render the right form based on type */}
      {type === "income" ? (
        <AddIncomeForm
          customerId={customerId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      ) : (
        <AddExpenseForm
          customerId={customerId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </Dialog>
  );
}