"use client";

import React, { useState, useEffect, useRef } from "react";
import { Minus, X, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";
import {
  getTodayDateString,
  isValidDateString,
  validateTransactionDate,
} from "@/lib/validations/formDateValidation";

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Rent",
  "Salaries",
  "Utilities",
  "Bills",
  "Supplies",
  "Food",
  "Transport",
  "Travel",
  "Shopping",
  "Tea & Refreshment",
  "General",
  "Other",
];

export interface AddExpenseFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  customerId?: string;
  lockCustomer?: boolean;
  customers?: Customer[];
  categories?: string[];
  minDate?: string;
  maxDate?: string;
  asModal?: boolean;
  initialAmount?: string | number;
  initialCategory?: string;
  initialDescription?: string;
  initialDate?: string;
  paymentMethod?: string;
  onSubmitCustom?: (payload: {
    amount: number;
    customerId: string | null;
    category: string;
    description: string;
    date: string;
    paymentMethod: string;
  }) => Promise<void>;
}

export function AddExpenseForm({
  isOpen = true,
  onClose,
  onSuccess,
  customerId: initialCustomerId = "",
  lockCustomer = false,
  customers: initialCustomers,
  categories = DEFAULT_EXPENSE_CATEGORIES,
  minDate = "2000-01-01",
  maxDate = getTodayDateString(),
  asModal = true,
  initialAmount = "",
  initialCategory = "",
  initialDescription = "",
  initialDate,
  paymentMethod = "cash",
  onSubmitCustom,
}: AddExpenseFormProps) {
  const { user } = useAuth();
  const { currencySymbol, theme } = useSettings();

  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers || []);
  const [formData, setFormData] = useState({
    amount: initialAmount ? String(initialAmount) : "",
    customerId: initialCustomerId,
    category: initialCategory,
    description: initialDescription,
    date: initialDate || getTodayDateString(),
    paymentMethod: paymentMethod || "cash",
  });

  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    date?: string;
    general?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  // Sync initial props if modal is reopened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: initialAmount ? String(initialAmount) : "",
        customerId: initialCustomerId,
        category: initialCategory,
        description: initialDescription,
        date: initialDate || getTodayDateString(),
        paymentMethod: paymentMethod || "cash",
      });
      setErrors({});
    }
  }, [isOpen, initialCustomerId, initialCategory, initialAmount, initialDescription, initialDate, paymentMethod]);

  // Load customers if not supplied
  useEffect(() => {
    if (!initialCustomers || initialCustomers.length === 0) {
      const userId = user?.id || "guest";
      hisabDoService.getCustomers(userId).then(setCustomerList).catch(console.error);
    } else {
      setCustomerList(initialCustomers);
    }
  }, [initialCustomers, user]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 1. Amount validation
    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    // 2. Category validation (Required single dropdown selection)
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Please select a category";
    }

    // 3. Date validation (Calendar selection or manual entry)
    const dateCheck = validateTransactionDate(formData.date, {
      minDate,
      maxDate,
      required: true,
    });
    if (!dateCheck.isValid) {
      newErrors.date = dateCheck.error || "Please enter a valid date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (val: string) => {
    setFormData((prev) => ({ ...prev, date: val }));
    const dateCheck = validateTransactionDate(val, { minDate, maxDate, required: true });
    setErrors((prev) => ({
      ...prev,
      date: dateCheck.isValid ? undefined : dateCheck.error,
    }));
  };

  const handleCategoryChange = (val: string) => {
    setFormData((prev) => ({ ...prev, category: val }));
    setErrors((prev) => ({
      ...prev,
      category: val ? undefined : "Please select a category",
    }));
  };

  const handleAmountChange = (val: string) => {
    setFormData((prev) => ({ ...prev, amount: val }));
    const num = parseFloat(val);
    setErrors((prev) => ({
      ...prev,
      amount: val && !isNaN(num) && num > 0 ? undefined : "Please enter a valid amount greater than 0",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate submission

    if (!validate()) return;

    setSubmitting(true);
    setErrors((prev) => ({ ...prev, general: undefined }));

    try {
      const numAmount = parseFloat(formData.amount);
      const payload = {
        amount: numAmount,
        customerId: formData.customerId || null,
        category: formData.category,
        description: formData.description || `${formData.category} Expense`,
        date: formData.date,
        paymentMethod: formData.paymentMethod || "cash",
      };

      if (onSubmitCustom) {
        await onSubmitCustom(payload);
      } else {
        const userId = user?.id || "guest";
        await hisabDoService.addExpense(userId, {
          amount: payload.amount,
          customer_id: payload.customerId,
          description: payload.description,
          category_id: payload.category,
          payment_method: payload.paymentMethod,
          expense_date: payload.date,
        });
      }

      // Reset and trigger callbacks
      setFormData({
        amount: "",
        customerId: initialCustomerId,
        category: "",
        description: "",
        date: getTodayDateString(),
        paymentMethod: "cash",
      });

      if (onSuccess) {
        await onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error("Error saving expense:", err);
      setErrors((prev) => ({
        ...prev,
        general: err?.message || "Failed to save expense transaction. Please try again.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div
      className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#303030]" : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#E53935] flex items-center gap-1.5">
            <Minus className="w-5 h-5" /> + Add Expense Entry
          </h3>
          <p className="text-xs text-slate-400">Record a new accounting transaction</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* General Error Banner */}
      {errors.general && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* 1. Amount */}
        <div>
          <label htmlFor="expense-amount" className="block text-xs font-semibold mb-1">
            Amount ({currencySymbol}) *
          </label>
          <input
            id="expense-amount"
            name="amount"
            type="number"
            step="any"
            required
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`w-full px-3 py-2 text-lg font-bold rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500 ${
              errors.amount ? "border-rose-500 ring-1 ring-rose-500" : ""
            }`}
            autoFocus
          />
          {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
        </div>

        {/* 2. Customer / Party */}
        <div>
          <label htmlFor="expense-customer" className="block text-xs font-semibold mb-1">
            Associated Customer / Party
          </label>
          <select
            id="expense-customer"
            name="customerId"
            disabled={lockCustomer}
            value={formData.customerId}
            onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
            className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
              theme === "dark" ? "bg-[#252525] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
            } ${lockCustomer ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <option value="">Direct / Walk-in (No Party)</option>
            {customerList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Category (Single Dropdown Required) */}
        <div>
          <label htmlFor="expense-category" className="block text-xs font-semibold mb-1">
            Category *
          </label>
          <select
            id="expense-category"
            name="category"
            required
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-rose-500 ${
              theme === "dark" ? "bg-[#252525] border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
            } ${errors.category ? "border-rose-500 ring-1 ring-rose-500" : ""}`}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-rose-500 mt-1">{errors.category}</p>}
        </div>

        {/* 4. Description / Notes */}
        <div>
          <label htmlFor="expense-description" className="block text-xs font-semibold mb-1">
            Description / Notes
          </label>
          <input
            id="expense-description"
            name="description"
            type="text"
            placeholder="e.g. Shop rent, electricity bill, tea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        {/* 5. Date Picker & Manual Entry */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-semibold mb-1">
            Date *
          </label>
          <div className="relative flex items-center">
            <input
              id="expense-date"
              name="date"
              type="text"
              placeholder="YYYY-MM-DD"
              value={formData.date}
              onChange={(e) => handleDateChange(e.target.value)}
              className={`w-full px-3 py-2 pr-10 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-rose-500 ${
                errors.date ? "border-rose-500 ring-1 ring-rose-500" : ""
              }`}
            />
            <div className="absolute right-2.5 flex items-center">
              <button
                type="button"
                onClick={() => {
                  try {
                    hiddenDateInputRef.current?.showPicker?.();
                  } catch {
                    hiddenDateInputRef.current?.focus();
                  }
                }}
                className="p-1 text-slate-400 hover:text-white transition"
                title="Open calendar picker"
                aria-label="Open calendar picker"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <input
                type="date"
                ref={hiddenDateInputRef}
                min={minDate}
                max={maxDate}
                value={isValidDateString(formData.date) ? formData.date : ""}
                onChange={(e) => {
                  if (e.target.value) {
                    handleDateChange(e.target.value);
                  }
                }}
                tabIndex={-1}
                aria-hidden="true"
                className="sr-only"
              />
            </div>
          </div>
          {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2 rounded-xl text-sm font-semibold border hover:bg-slate-800/40 transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-[#E53935] text-white hover:bg-rose-600 transition shadow-md disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Entry</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {formContent}
      </div>
    );
  }

  return formContent;
}

export default AddExpenseForm;

