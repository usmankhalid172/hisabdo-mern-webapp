"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

const expenseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),

  amount: z.coerce
    .number()
    .positive("Amount must be greater than 0"),

  category: z.enum([
    "Rent",
    "Utilities",
    "Salaries",
    "Supplies",
    "Other",
  ]),

  date: z.string().min(1, "Date is required"),
});

// Input type = data coming from the form
export type ExpenseFormInput = z.input<typeof expenseSchema>;

// Output type = validated data returned by Zod
export type ExpenseFormData = z.output<typeof expenseSchema>;

export interface ExpenseItem extends ExpenseFormData {
  id: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initialData?: ExpenseItem | null;
}

export function ExpenseModal({
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
  } = useForm<ExpenseFormInput, any, ExpenseFormData>({
    resolver: zodResolver(expenseSchema),

    defaultValues: {
      title: "",
      amount: 0,
      category: "Utilities",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      setValue("title", initialData.title);
      setValue("amount", initialData.amount);
      setValue("category", initialData.category);
      setValue("date", initialData.date);
    } else {
      reset({
        title: "",
        amount: 0,
        category: "Utilities",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, setValue, reset, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);

    reset({
      title: "",
      amount: 0,
      category: "Utilities",
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
          {initialData ? "Edit Expense" : "Record New Expense"}
        </h2>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >

          {/* Expense Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Expense Title
            </label>

            <input
              {...register("title")}
              placeholder="e.g. Electricity Bill"
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.title && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Amount */}
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

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Category
            </label>

            <select
              {...register("category")}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Rent">Rent</option>
              <option value="Utilities">Utilities</option>
              <option value="Salaries">Salaries</option>
              <option value="Supplies">Supplies</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Date
            </label>

            <input
              type="date"
              {...register("date")}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />

            {errors.date && (
              <p className="text-xs text-rose-500 mt-1">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Buttons */}
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
              {initialData ? "Update Expense" : "Save Expense"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}