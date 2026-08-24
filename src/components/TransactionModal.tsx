"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => void;
  initialData?: TransactionItem | null;
}
export function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ModalProps) {
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
      type: "Got Money",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("partyName", initialData.partyName);
      setValue("amount", initialData.amount);
      setValue("type", initialData.type);
      setValue("date", initialData.date);
    } else {
      reset({
        partyName: "",
        amount: 0,
        type: "Got Money",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, setValue, reset, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit(data);

    reset({
      partyName: "",
      amount: 0,
      type: "Got Money",
      date: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">
          {initialData ? "Edit Transaction" : "Record New Transaction"}
        </h2>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Customer / Party Name
            </label>

            <input
              {...register("partyName")}
              placeholder="e.g. Ali Traders"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.partyName && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.partyName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Transaction Type
            </label>

            <select
              {...register("type")}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Got Money">
                Got Money (Cash In +)
              </option>

              <option value="Gave Money">
                Gave Money (Cash Out -)
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Amount (Rs.)
            </label>

            <input
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Date
            </label>

            <input
              type="date"
              {...register("date")}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-300"
            />

            {errors.date && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.date.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {initialData ? "Update Transaction" : "Save Transaction"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}