"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useAuth } from "@/context/AuthContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";

const transactionSchema = z.object({
  partyName: z.string().min(2, "Party/Customer name is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["Got Money", "Gave Money"]),
  date: z.string().min(1, "Date is required"),
});

type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormData = z.output<typeof transactionSchema>;

export interface TransactionItem extends TransactionFormData {
  id: string;
}

interface ModalProps {
  /** If undefined, renders directly as an inner form (dialog‑compatible). If boolean, toggles modal overlay. */
  isOpen?: boolean;
  /** Called when the modal is closed via cancel button or overlay. */
  onClose?: () => void;
  /** Callback when the form is submitted successfully (after service save). */
  onSuccess?: (transaction?: any) => void | Promise<void>;
  /** Callback invoked when the user cancels or closes the form without successful submission. */
  onCancel?: () => void;
  /** Legacy submit callback (optional). */
  onSubmit?: (data: TransactionFormData) => void;
  /** Initial data for edit mode. */
  initialData?: TransactionItem | null;
  /** Optional customerId to associate transaction with a specific customer */
  customerId?: string;
  /** Optional initial transaction type */
  defaultType?: "Got Money" | "Gave Money";
  /** Optional custom title when rendered as modal */
  title?: string;
  /** Additional class names for the outer container */
  className?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  onCancel,
  initialData,
  customerId,
  defaultType = "Got Money",
  title,
  className = "",
}: ModalProps) {
  const auth = useAuth?.();
  const userId = auth?.user?.id || "guest";

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormInput, any, TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      partyName: "",
      amount: 0,
      type: defaultType,
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Load customer when customerId is supplied
  useEffect(() => {
    let active = true;
    if (customerId) {
      hisabDoService
        .getCustomers(userId)
        .then((list) => {
          if (!active) return;
          const found = list.find((c) => c.id === customerId);
          if (found) {
            setCustomer(found);
            setValue("partyName", found.name);
          } else {
            setValue("partyName", `Customer (${customerId})`);
          }
        })
        .catch(() => {
          if (active) setValue("partyName", `Customer (${customerId})`);
        });
    } else {
      setCustomer(null);
    }
    return () => {
      active = false;
    };
  }, [customerId, userId, setValue]);

  // Populate form for edit or reset on open
  useEffect(() => {
    if (initialData) {
      setValue("partyName", initialData.partyName);
      setValue("amount", initialData.amount);
      setValue("type", initialData.type);
      setValue("date", initialData.date);
    } else {
      reset({
        partyName: customer ? customer.name : "",
        amount: 0,
        type: defaultType,
        date: new Date().toISOString().split("T")[0],
      });
    }
    setGeneralError(null);
  }, [initialData, setValue, reset, isOpen, defaultType, customer]);

  // If the caller explicitly closed the modal, render nothing
  if (isOpen === false) {
    return null;
  }

  const handleFormSubmit = async (data: TransactionFormData) => {
    setSubmitting(true);
    setGeneralError(null);
    try {
      // legacy onSubmit
      if (onSubmit) await onSubmit(data);

      // service call
      const isIncome = data.type === "Got Money";
      let saved: any = data;
      if (isIncome) {
        saved = await hisabDoService.addIncome(userId, {
          amount: Number(data.amount),
          customer_id: customerId || null,
          description: `${data.partyName} - Got Money`,
          category_id: "Sales",
          payment_method: "cash",
          income_date: data.date,
        });
      } else {
        saved = await hisabDoService.addExpense(userId, {
          amount: Number(data.amount),
          customer_id: customerId || null,
          description: `${data.partyName} - Gave Money`,
          category_id: "General",
          payment_method: "cash",
          expense_date: data.date,
        });
      }

      // reset form
      reset({
        partyName: customer ? customer.name : "",
        amount: 0,
        type: defaultType,
        date: new Date().toISOString().split("T")[0],
      });

      if (onSuccess) await onSuccess(saved);

      if (onClose) onClose();
    } catch (err: any) {
      console.error("Failed to save transaction:", err);
      setGeneralError(err?.message || "Failed to record transaction. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {generalError && (
        <div className="p-3 rounded-control text-xs font-semibold bg-danger/10 border border-danger/30 text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Customer / Party Name */}
      {customerId ? (
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-1 text-start">
            Associated Customer
          </label>
          <div className="ps-3 pe-3 py-2 rounded-control bg-surface-muted border border-border text-foreground text-sm font-medium flex items-center justify-between">
            <span>{customer ? customer.name : "Customer Account"}</span>
            <span className="text-xs text-muted-foreground">
              {customer?.phone || (customerId.length > 12 ? `${customerId.slice(0, 8)}...` : customerId)}
            </span>
          </div>
          {/* hidden field for react‑hook‑form */}
          <input type="hidden" {...register("partyName")} />
        </div>
      ) : (
        <Input
          label="Customer / Party Name"
          placeholder="e.g. Ali Traders"
          error={errors.partyName?.message}
          {...register("partyName")}
        />
      )}

      {/* Transaction Type */}
      <div>
        <Select label="Transaction Type" {...register("type")}> 
          <option value="Got Money">Got Money (Cash In +)</option>
          <option value="Gave Money">Gave Money (Cash Out -)</option>
        </Select>
        {errors.type && (
          <p className="text-xs text-danger mt-1 text-start">{errors.type.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <Input
          label="Amount (Rs.)"
          type="number"
          step="any"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register("amount")}
        />
      </div>

      {/* Date */}
      <div>
        <Input
          label="Date"
          type="date"
          error={errors.date?.message}
          {...register("date")}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        {onClose && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              if (onCancel) onCancel();
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="accent"
          size="sm"
          loading={submitting}
          disabled={submitting}
        >
          {initialData ? "Update Transaction" : "Save Transaction"}
        </Button>
      </div>
    </form>
  );

  // Embedded usage (no modal wrapper)
  if (isOpen === undefined) {
    return <div className={`w-full ${className}`}>{formContent}</div>;
  }

  // Standalone modal overlay
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-surface border border-border text-foreground w-full max-w-md rounded-dialog p-6 shadow-dialog relative ${className}`}>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              if (onCancel) onCancel();
              onClose();
            }}
            className="absolute end-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-control transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-lg font-bold text-foreground mb-4 text-start">
          {title || (initialData ? "Edit Transaction" : "Record New Transaction")}
        </h2>
        {formContent}
      </div>
    </div>
  );
}

export const TransactionForm = TransactionModal;
export default TransactionModal;
