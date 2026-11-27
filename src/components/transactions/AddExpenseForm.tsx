"use client";

import React, { useState, useEffect } from "react";
import { Minus, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";
import {
  getTodayDateString,
  validateDateRestrictions,
} from "@/lib/validations/formDateValidation";
import DatePickerPopover from "@/components/ui/DatePickerPopover";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CategoryInputDropdown } from "./CategoryInputDropdown";

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
  onCancel?: () => void;
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
  onCancel,
  onSuccess,
  customerId = "",
  lockCustomer = false,
  customers: initialCustomers,
  categories = DEFAULT_EXPENSE_CATEGORIES,
  asModal = true,
  initialAmount = "",
  initialCategory = "",
  initialDescription = "",
  initialDate,
  paymentMethod = "cash",
  onSubmitCustom,
}: AddExpenseFormProps) {
  const { user } = useAuth();
  const { currencySymbol } = useSettings();

  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers || []);
  const [categoryList, setCategoryList] = useState<string[]>(categories || DEFAULT_EXPENSE_CATEGORIES);
  const [formData, setFormData] = useState({
    amount: initialAmount ? String(initialAmount) : "",
    customerId: customerId,
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
  const [confirmedWarning, setConfirmedWarning] = useState(false);
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    message: string;
  }>({
    isOpen: false,
    message: "",
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onClose) {
      onClose();
    }
  };

  // Sync initial props if modal is reopened or props change
  useEffect(() => {
    if (isOpen) {
      setFormData({
        amount: initialAmount ? String(initialAmount) : "",
        customerId: customerId,
        category: initialCategory,
        description: initialDescription,
        date: initialDate || getTodayDateString(),
        paymentMethod: paymentMethod || "cash",
      });
      setErrors({});
      setConfirmedWarning(false);
      setWarningModal({ isOpen: false, message: "" });
    }
  }, [isOpen, customerId, initialCategory, initialAmount, initialDescription, initialDate, paymentMethod]);

  // Load customers if not supplied
  useEffect(() => {
    if (!initialCustomers || initialCustomers.length === 0) {
      const userId = user?.id || "guest";
      hisabDoService.getCustomers(userId).then(setCustomerList).catch(console.error);
    } else {
      setCustomerList(initialCustomers);
    }
  }, [initialCustomers, user]);

  // Load persistent categories
  useEffect(() => {
    if (isOpen) {
      const userId = user?.id || "guest";
      hisabDoService.getCategories(userId, "expense").then((cats) => {
        if (cats && cats.length > 0) {
          setCategoryList(cats);
        }
      }).catch(console.error);
    }
  }, [isOpen, user]);

  const handleAddCategory = async (newCat: string) => {
    const userId = user?.id || "guest";
    const added = await hisabDoService.addCategory(userId, newCat, "expense");
    setCategoryList((prev) => {
      if (prev.some((c) => c.toLowerCase() === added.toLowerCase())) return prev;
      return [...prev, added];
    });
    setFormData((prev) => ({ ...prev, category: added }));
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 1. Amount validation: must be greater than zero
    const numAmount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0";
    }

    // 2. Category validation: required and cannot be empty
    if (!formData.category || !formData.category.trim()) {
      newErrors.category = "Please select a category";
    }

    // 3. Date validation: hard limits and calendar validity
    const dateCheck = validateDateRestrictions(formData.date);
    if (!dateCheck.isValid) {
      newErrors.date = dateCheck.error || "Please enter a valid date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (val: string) => {
    setFormData((prev) => ({ ...prev, date: val }));
    setConfirmedWarning(false);
    const dateCheck = validateDateRestrictions(val);
    setErrors((prev) => ({
      ...prev,
      date: dateCheck.isValid ? undefined : dateCheck.error,
    }));
  };

  const handleCategoryChange = (val: string) => {
    setFormData((prev) => ({ ...prev, category: val }));
    setErrors((prev) => ({
      ...prev,
      category: val && val.trim() ? undefined : "Please select a category",
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

  const executeSave = async () => {
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
        customerId: customerId,
        category: "",
        description: "",
        date: getTodayDateString(),
        paymentMethod: "cash",
      });
      setConfirmedWarning(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    // Check for date confirmation warnings (>90 days past, >1 year future)
    const dateCheck = validateDateRestrictions(formData.date);
    if (dateCheck.isWarning && !confirmedWarning) {
      setWarningModal({
        isOpen: true,
        message:
          dateCheck.warningMessage ||
          "The selected date requires confirmation. Are you sure you want to proceed?",
      });
      return;
    }

    await executeSave();
  };

  const handleConfirmWarning = async () => {
    setConfirmedWarning(true);
    setWarningModal({ isOpen: false, message: "" });
    await executeSave();
  };

  const formContent = (
    <div className="w-full max-w-md rounded-card border border-border bg-surface text-foreground p-6 space-y-4 shadow-dialog">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-danger flex items-center gap-1.5">
            <Minus className="w-5 h-5" /> + Add Expense Entry
          </h3>
          <p className="text-xs text-muted-foreground">Record a new accounting transaction</p>
        </div>
        {(onCancel || onClose) && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground transition p-1 rounded-control"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* General Error Banner */}
      {errors.general && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-control bg-danger/10 border border-danger/30 text-danger">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* 1. Amount */}
        <div>
          <label htmlFor="expense-amount" className="block text-xs font-semibold mb-1 text-foreground">
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
            className={`w-full px-3 py-2 text-lg font-bold rounded-control border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary ${
              errors.amount ? "border-danger ring-1 ring-danger text-danger" : "border-border"
            }`}
            autoFocus
          />
          {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
        </div>

        {/* 2. Customer / Party - Hidden if customerId prop is provided */}
        {!customerId && (
          <div>
            <label htmlFor="expense-customer" className="block text-xs font-semibold mb-1 text-foreground">
              Associated Customer / Party
            </label>
            <select
              id="expense-customer"
              name="customerId"
              disabled={lockCustomer}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className={`w-full px-3 py-2 rounded-control text-sm border bg-surface text-foreground border-border focus:outline-none focus:ring-1 focus:ring-primary ${
                lockCustomer ? "opacity-75 cursor-not-allowed bg-surface-muted" : ""
              }`}
            >
              <option value="">Direct / Walk-in (No Party)</option>
              {customerList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone ? `(${c.phone})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Category (Combined Text Input and Dropdown) */}
        <div>
          <label htmlFor="expense-category" className="block text-xs font-semibold mb-1 text-foreground">
            Category *
          </label>
          <CategoryInputDropdown
            id="expense-category"
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            categories={categoryList}
            onAddCategory={handleAddCategory}
            error={errors.category}
            placeholder="Select or type category..."
            variant="expense"
            required
          />
        </div>

        {/* 4. Description / Notes */}
        <div>
          <label htmlFor="expense-description" className="block text-xs font-semibold mb-1 text-foreground">
            Description / Notes
          </label>
          <input
            id="expense-description"
            name="description"
            type="text"
            placeholder="e.g. Shop rent, electricity bill, tea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-control text-sm border bg-surface text-foreground border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 5. Date Picker & Manual Entry (Themed Popover & DD-MM-YYYY) */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-semibold mb-1 text-foreground">
            Date *
          </label>
          <DatePickerPopover
            id="expense-date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            error={errors.date}
            variant="expense"
            required
          />
          {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {(onCancel || onClose) && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex-1 py-2 rounded-control text-sm font-semibold border border-border bg-surface text-foreground hover:bg-surface-muted transition disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded-control text-sm font-bold flex items-center justify-center gap-2 bg-danger text-white hover:opacity-90 transition shadow-card disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Entry</span>
          </button>
        </div>
      </form>

      {/* Confirmation Dialog for Date Warnings (>90 days past, >1 year future) */}
      <ConfirmDialog
        isOpen={warningModal.isOpen}
        onClose={() => setWarningModal({ isOpen: false, message: "" })}
        onConfirm={handleConfirmWarning}
        title="Are you sure?"
        message={warningModal.message}
        confirmText="Yes, Proceed"
        cancelText="Review Date"
      />
    </div>
  );

  if (asModal) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        {formContent}
      </div>
    );
  }

  return formContent;
}

export default AddExpenseForm;
