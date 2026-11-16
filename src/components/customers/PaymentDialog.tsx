"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
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
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        {/* onCancel prop add kar diya hai */}
        <TransactionForm 
          customerId={customerId} 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      </DialogContent>
    </Dialog>
  );
}