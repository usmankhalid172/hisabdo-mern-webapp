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

  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),

  type: z.enum(["Got Money", "Gave Money"]),

  date: z.string().min(1, "Date is required"),
});

export type TransactionFormInput = z.input<typeof transactionSchema>;
export type TransactionFormData = z.output<typeof transactionSchema>;

export interface TransactionItem extends TransactionFormData {
  id: string;
}

export interface TransactionModalProps {
  /** If undefined, renders directly as an inner form (dialog-compatible). If boolean, toggles modal overlay. */
  isOpen?: boolean;
  onClose?: () => void;
  onSubmit?: (data: TransactionFormData) => void;
  initialData?: TransactionItem | null;
  /** Optional customerId to associate transaction with a specific customer */
  customerId?: string;
  /** Optional onSuccess callback called only after successful save */
  onSuccess?: (transaction?: any) => void | Promise<void>;
  /** Optional initial transaction type */
  defaultType?: "Got Money" | "Gave Money";
  /** Optional custom title when rendered as modal */
  title?: string;
  className?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  customerId,
  onSuccess,
  defaultType = "Got Money",
  title,
  className = "",
}: TransactionModalProps) {
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

  // Resolve customer details when customerId is provided
  useEffect(() => {
    let isMounted = true;
    if (customerId) {
      hisabDoService
        .getCustomers(userId)
        .then((list) => {
          if (!isMounted) return;
          const found = list.find((c) => c.id === customerId);
          if (found) {
            setCustomer(found);
            setValue("partyName", found.name);
          } else {
            setValue("partyName", `Customer (${customerId})`);
          }
        })
        .catch(() => {
          if (isMounted) {
            setValue("partyName", `Customer (${customerId})`);
          }
        });
    } else {
      setCustomer(null);
    }
    return () => {
      isMounted = false;
    };
  }, [customerId, userId, setValue]);

  // Sync initialData or reset on open
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

  // If explicitly closed as a modal, render nothing
  if (isOpen === false) {
    return null;
  }

  const handleFormSubmit = async (data: TransactionFormData) => {
    setSubmitting(true);
    setGeneralError(null);

    try {
      let savedResult: any = data;

      // 1. Invoke legacy onSubmit callback if provided
      if (onSubmit) {
        await onSubmit(data);
      }

      // 2. Persist to HisabDo ledger service
      const isIncome = data.type === "Got Money";
      if (isIncome) {
        savedResult = await hisabDoService.addIncome(userId, {
          amount: Number(data.amount),
          customer_id: customerId || null,
          description: `${data.partyName} - Got Money`,
          category_id: "Sales",
          payment_method: "cash",
          income_date: data.date,
        });
      } else {
        savedResult = await hisabDoService.addExpense(userId, {
          amount: Number(data.amount),
          customer_id: customerId || null,
          description: `${data.partyName} - Gave Money`,
          category_id: "General",
          payment_method: "cash",
          expense_date: data.date,
        });
      }

      // 3. Reset form
      reset({
        partyName: customer ? customer.name : "",
        amount: 0,
        type: defaultType,
        date: new Date().toISOString().split("T")[0],
      });

      // 4. Fire onSuccess callback ONLY after successful save
      if (onSuccess) {
        await onSuccess(savedResult);
      }

      // 5. Close modal if onClose provided
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error("Failed to save transaction:", err);
      setGeneralError(
        err?.message || "Failed to record transaction. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // The inner form content (reusable inside any dialog or modal)
  const formContent = (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {generalError && (
        <div className="p-3 rounded-control text-xs font-semibold bg-danger/10 border border-danger/30 text-danger flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Associated Customer or Party Name Input */}
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
          {/* Hidden input to maintain hook-form state */}
          <input type="hidden" {...register("partyName")} />
        </div>
      ) : (
        <div>
          <Input
            label="Customer / Party Name"
            placeholder="e.g. Ali Traders"
            error={errors.partyName?.message}
            {...register("partyName")}
          />
        </div>
      )}

      {/* Transaction Type */}
      <div>
        <Select
          label="Transaction Type"
          {...register("type")}
        >
          <option value="Got Money">Got Money (Cash In +)</option>
          <option value="Gave Money">Gave Money (Cash Out -)</option>
        </Select>
        {errors.type && (
          <p className="text-xs text-danger mt-1 text-start">
            {errors.type.message}
          </p>
        )}
      </div>

      {/* Amount (Rs.) */}
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
            onClick={onClose}
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

  // If isOpen is undefined, this component is placed inside an external Dialog (dialog-compatible)
  if (isOpen === undefined) {
    return <div className={`w-full ${className}`}>{formContent}</div>;
  }

  // Standalone Modal Mode (when isOpen === true)
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-surface border border-border text-foreground w-full max-w-md rounded-dialog p-6 shadow-dialog relative ${className}`}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
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

// Named alias for dialog integrations (e.g. Danish's PaymentDialog & AddTransactionDialog)
export const TransactionForm = TransactionModal;

export default TransactionModal;
