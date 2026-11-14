"use client";

import React from "react";
import {
  TransactionModal,
  type TransactionFormData,
} from "@/components/TransactionModal";

export interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  defaultType?: "Got Money" | "Gave Money";
  onSubmit: (data: TransactionFormData & { customerId: string }) => void;
}

export function PaymentDialog({
  isOpen,
  onClose,
  customerId,
  customerName,
  defaultType = "Got Money",
  onSubmit,
}: PaymentDialogProps) {
  const handleSubmit = (data: TransactionFormData) => {
    onSubmit({ ...data, customerId });
  };

  return (
    <TransactionModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialData={{
        id: "",
        partyName: customerName,
        amount: 0,
        type: defaultType,
        date: new Date().toISOString().split("T")[0],
      }}
    />
  );
}