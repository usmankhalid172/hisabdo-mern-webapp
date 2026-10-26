"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
} from "lucide-react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

const PAYMENT_METHODS = [
  { value: "Cash", label: "Cash In Hand" },
  { value: "Bank Transfer", label: "Online Bank Transfer" },
  { value: "EasyPaisa", label: "EasyPaisa Mobile Wallet" },
  { value: "JazzCash", label: "JazzCash Mobile Wallet" },
  { value: "Cheque", label: "Bank Cheque" },
  { value: "Credit Card", label: "Credit / Debit Card" },
];

const getTodayDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const initialFormData = (type = "GAVE_CREDIT") => ({
  type,
  amount: "",
  date: getTodayDate(),
  paymentMethod: "Cash",
  billNumber: "",
  description: "",
});

export default function AddCustomerTransactionModal({
  isOpen,
  onClose,
  customer,
  defaultType = "GAVE_CREDIT",
  onSuccess,
}) {
  const [formData, setFormData] = useState(() =>
    initialFormData(defaultType)
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData(defaultType));
      setErrors({});
      setLoading(false);
    }
  }, [defaultType, isOpen, customer?.id, customer?._id]);

  if (!customer) return null;

  const customerId = customer.id ?? customer._id;
  const isCredit = formData.type === "GAVE_CREDIT";
  const netBalance = Number(
    customer.netBalance ?? customer.net_balance ?? 0
  );

  const handleChange = (eventOrValue) => {
    // Supports standard input events and custom UI components that
    // may return a value directly.
    const target = eventOrValue?.target;
    const name = target?.name;
    const value = target ? target.value : eventOrValue;

    if (!name) return;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      general: undefined,
    }));
  };

  const handleTypeChange = (type) => {
    setFormData((previous) => ({ ...previous, type }));
    setErrors({});
  };

  const validateForm = () => {
    const nextErrors = {};
    const amount = Number(formData.amount);

    if (!customerId) {
      nextErrors.general =
        "Customer ID is missing. Refresh the customer list and try again.";
    }

    if (!String(formData.amount).trim()) {
      nextErrors.amount = "Transaction amount is required.";
    } else if (!Number.isFinite(amount) || amount <= 0) {
      nextErrors.amount = "Amount must be greater than zero.";
    } else if (amount > 10000000) {
      nextErrors.amount = "Amount cannot exceed Rs. 10,000,000.";
    }

    if (!formData.date) {
      nextErrors.date = "Transaction date is required.";
    } else if (Number.isNaN(new Date(formData.date).getTime())) {
      nextErrors.date = "Please select a valid transaction date.";
    }

    if (!PAYMENT_METHODS.some(
      (method) => method.value === formData.paymentMethod
    )) {
      nextErrors.paymentMethod = "Please select a valid payment method.";
    }

    if (formData.billNumber.trim().length > 50) {
      nextErrors.billNumber = "Bill number cannot exceed 50 characters.";
    }

    if (formData.description.trim().length > 300) {
      nextErrors.description = "Description cannot exceed 300 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setErrors({});

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("hisabdo_token")
          : null;

      const payload = {
        partyType: "Customer",
        customerId,
        type: formData.type,
        amount: Number(formData.amount),
        // Midday avoids shifting the selected date in some time zones.
        date: new Date(`${formData.date}T12:00:00`).toISOString(),
        paymentMethod: formData.paymentMethod,
        billNumber: formData.billNumber.trim(),
        description: formData.description.trim(),
      };

      const response = await fetch(
        `/api/customers/${encodeURIComponent(customerId)}/transactions`,
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const message =
          data?.message ||
          data?.error ||
          (response.status === 401
            ? "Your session is invalid. Please log in again."
            : response.status === 404
              ? "Customer not found. Refresh the customer list and try again."
              : "Failed to record transaction. Please try again.");

        const nextErrors = {
          general: message,
        };

        if (data?.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
              nextErrors[key] = value.join(" ");
            }
          });
        }

        setErrors(nextErrors);
        return;
      }

      if (!data.data) {
        setErrors({
          general:
            "The server did not return the saved transaction. Refresh the page to verify whether it was recorded.",
        });
        return;
      }

      if (data?.warning && typeof window !== "undefined") {
        window.alert(data.warning);
      }

      if (typeof onSuccess === "function") {
        onSuccess(data.data, data.customer ?? customer, data.warning);
      }

      onClose();
    } catch (error) {
      console.error("Customer transaction submission failed:", error);

      setErrors({
        general:
          "Unable to connect to the server. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title={
        isCredit
          ? `🔴 You Gave Udhar (Credit) to ${customer.name}`
          : `🟢 You Got Wasooli (Payment) from ${customer.name}`
      }
      maxWidth="550px"
    >
      <form onSubmit={handleSubmit} noValidate>
        {errors.general && (
          <div
            role="alert"
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid #ef4444",
              color: "#f87171",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            {errors.general}
          </div>
        )}

        {/* Transaction Type Toggle */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            background: "rgba(15, 23, 42, 0.8)",
            padding: "0.35rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginBottom: "1.25rem",
          }}
        >
          <button
            type="button"
            disabled={loading}
            onClick={() => handleTypeChange("GAVE_CREDIT")}
            aria-pressed={isCredit}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              background: isCredit
                ? "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)"
                : "transparent",
              color: isCredit ? "white" : "#94a3b8",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              boxShadow: isCredit
                ? "0 4px 12px rgba(239, 68, 68, 0.3)"
                : "none",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <ArrowUpRight size={18} />
            You Gave (Udhar)
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleTypeChange("GOT_PAYMENT")}
            aria-pressed={!isCredit}
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              background: !isCredit
                ? "linear-gradient(135deg, #10b981 0%, #047857 100%)"
                : "transparent",
              color: !isCredit ? "white" : "#94a3b8",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              fontSize: "0.9rem",
              boxShadow: !isCredit
                ? "0 4px 12px rgba(16, 185, 129, 0.3)"
                : "none",
              opacity: loading ? 0.6 : 1,
            }}
          >
            <ArrowDownLeft size={18} />
            You Got (Wasooli)
          </button>
        </div>

        {/* Current Balance */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            background: "rgba(30, 41, 59, 0.5)",
            padding: "0.75rem 1rem",
            borderRadius: "10px",
            marginBottom: "1.25rem",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
            Current Customer Net Balance:
          </span>

          <span
            style={{
              fontSize: "1rem",
              fontWeight: 800,
              whiteSpace: "nowrap",
              color:
                netBalance > 0
                  ? "#f87171"
                  : netBalance < 0
                    ? "#34d399"
                    : "#94a3b8",
            }}
          >
            Rs. {Math.abs(netBalance).toLocaleString()}{" "}
            {netBalance > 0
              ? "(Receivable)"
              : netBalance < 0
                ? "(Advance)"
                : "(Settled)"}
          </span>
        </div>

        <Input
          label="Transaction Amount (PKR)"
          name="amount"
          type="number"
          placeholder="e.g. 15000"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          icon={DollarSign}
          required
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Input
            label="Transaction Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            icon={Calendar}
            required
          />

          <Select
            label="Payment Method"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            options={PAYMENT_METHODS}
            error={errors.paymentMethod}
          />
        </div>

        <Input
          label="Bill / Invoice / Receipt #"
          name="billNumber"
          placeholder="e.g. INV-9042 or REC-102"
          value={formData.billNumber}
          onChange={handleChange}
          error={errors.billNumber}
          icon={FileText}
        />

        <Input
          label="Item Details / Remarks / Notes"
          name="description"
          placeholder="e.g. 5 Cartons Cloth consignment delivered via Goods Transport"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "0.75rem",
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            variant={isCredit ? "danger" : "success"}
            size="md"
            type="submit"
            loading={loading}
            disabled={loading}
            icon={Plus}
          >
            {loading
              ? "Saving..."
              : `Save ${
                  isCredit
                    ? "Credit Entry (Udhar)"
                    : "Payment Entry (Wasooli)"
                }`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
