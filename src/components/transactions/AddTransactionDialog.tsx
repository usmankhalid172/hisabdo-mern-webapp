"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
// NOTE: Jab Aiman ka form merge hoga, tab yeh import path check kar lena. 
// Agar uska path alag hai, toh yahan change karna.
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
    onOpenChange(false); // Success par dialog close kar do
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        {/* Aiman ka Shared Form */}
        <TransactionForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}