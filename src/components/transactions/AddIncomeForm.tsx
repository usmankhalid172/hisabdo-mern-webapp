"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";
import {
  getTodayDateString,
  validateDateRestrictions,
} from "@/lib/validations/formDateValidation";
import DatePickerPopover from "@/components/ui/DatePickerPopover";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export const DEFAULT_INCOME_CATEGORIES = [
  "Sales",
  "Salary",
  "Gift",
  "Service Fee",
  "Commission",
  "Other",
];

export interface AddIncomeFormProps {
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

export function AddIncomeForm({
  isOpen = true,
  onClose,
  onCancel,
  onSuccess,
  customerId = "",
  lockCustomer = false,
  customers: initialCustomers,
  categories = DEFAULT_INCOME_CATEGORIES,
  asModal = true,
  initialAmount = "",
  initialCategory = "",
  initialDescription = "",
  initialDate,
  paymentMethod = "cash",
  onSubmitCustom,
}: AddIncomeFormProps) {
  const { user } = useAuth();
  const { currencySymbol } = useSettings();

  const [customerList, setCustomerList] = useState<Customer[]>(initialCustomers || []);
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
        description: formData.description || `${formData.category} Income`,
        date: formData.date,
        paymentMethod: formData.paymentMethod || "cash",
      };

      if (onSubmitCustom) {
        await onSubmitCustom(payload);
      } else {
        const userId = user?.id || "guest";
        await hisabDoService.addIncome(userId, {
          amount: payload.amount,
          customer_id: payload.customerId,
          description: payload.description,
          category_id: payload.category,
          payment_method: payload.paymentMethod,
          income_date: payload.date,
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
      console.error("Error saving income:", err);
      setErrors((prev) => ({
        ...prev,
        general: err?.message || "Failed to save income transaction. Please try again.",
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
          <h3 className="text-lg font-bold text-success flex items-center gap-1.5">
            <Plus className="w-5 h-5" /> + Add Income Entry
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
          <label htmlFor="income-amount" className="block text-xs font-semibold mb-1 text-foreground">
            Amount ({currencySymbol}) *
          </label>
          <input
            id="income-amount"
            name="amount"
            type="number"
            step="any"
            required
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className={`w-full px-3 py-2 text-lg font-bold rounded-control border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              errors.amount ? "border-danger ring-1 ring-danger text-danger" : "border-border"
            }`}
            autoFocus
          />
          {errors.amount && <p className="text-xs text-danger mt-1">{errors.amount}</p>}
        </div>

        {/* 2. Customer / Party - Hidden if customerId prop is provided */}
        {!customerId && (
          <div>
            <label htmlFor="income-customer" className="block text-xs font-semibold mb-1 text-foreground">
              Associated Customer / Party
            </label>
            <select
              id="income-customer"
              name="customerId"
              disabled={lockCustomer}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className={`w-full px-3 py-2 rounded-control text-sm border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
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

        {/* 3. Category (Single Dropdown Required) */}
        <div>
          <label htmlFor="income-category" className="block text-xs font-semibold mb-1 text-foreground">
            Category *
          </label>
          <select
            id="income-category"
            name="category"
            required
            value={formData.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-control text-sm border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              errors.category ? "border-danger ring-1 ring-danger text-danger" : "border-border"
            }`}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
        </div>

        {/* 4. Description / Notes */}
        <div>
          <label htmlFor="income-description" className="block text-xs font-semibold mb-1 text-foreground">
            Description / Notes
          </label>
          <input
            id="income-description"
            name="description"
            type="text"
            placeholder="e.g. Sold accessories, service payment"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 rounded-control text-sm border bg-surface text-foreground border-border focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* 5. Date Picker & Manual Entry (Themed Popover & DD-MM-YYYY) */}
        <div>
          <label htmlFor="income-date" className="block text-xs font-semibold mb-1 text-foreground">
            Date *
          </label>
          <DatePickerPopover
            id="income-date"
            name="date"
            value={formData.date}
            onChange={handleDateChange}
            error={errors.date}
            variant="income"
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
            className="flex-1 py-2 rounded-control text-sm font-bold flex items-center justify-center gap-2 bg-success text-white hover:opacity-90 transition shadow-card disabled:opacity-60"
            style={{ backgroundColor: "#00E676" }}
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

export default AddIncomeForm;
