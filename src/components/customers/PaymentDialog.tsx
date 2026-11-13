"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
// NOTE: Jab Aiman ka form merge hoga, tab yeh import path check kar lena.
import { TransactionForm } from "@/components/transactions/TransactionForm";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  onSuccess?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  customerId,
  onSuccess,
}: PaymentDialogProps) {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onOpenChange(false); // Success par dialog close kar do
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        {/* Aiman ka Shared Form with optional customerId */}
        <TransactionForm customerId={customerId} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}