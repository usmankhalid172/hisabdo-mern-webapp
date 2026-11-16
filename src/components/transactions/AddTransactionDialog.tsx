"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { TransactionForm } from "@/components/transactions/TransactionForm";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionDialogProps) {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };

  // Yeh naya function add hua hai
  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        {/* onCancel prop add kar diya hai */}
        <TransactionForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}