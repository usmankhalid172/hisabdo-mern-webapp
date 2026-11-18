"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Mail,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  FileText,
  MessageCircle,
  MoreVertical,
  X,
  Loader2,
  Trash2,
  Edit2,
  ArrowRightLeft,
  CheckCircle,
} from "lucide-react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";
import { getFriendlyError } from "@/lib/friendlyErrors";
import CustomerCard from "@/components/customers/CustomerCard";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerSearchFilter from "@/components/customers/CustomerSearchFilter";
import type { CustomerFormValues } from "@/components/customers/CustomerForm";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";

export default function CustomersPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, theme, t, businessProfile } = useSettings();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerBalances, setCustomerBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "receivable" | "payable" | "settled">("all");

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [paymentModalCustomer, setPaymentModalCustomer] = useState<Customer | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    opening_balance: 0,
    notes: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    type: "received" as "received" | "paid",
    category: "Cash",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const userId = user?.id || "guest";
      const custs = await hisabDoService.getCustomers(userId);
      setCustomers(custs);

      // Compute live running balances for all customers
      const balances: Record<string, number> = {};
      for (const c of custs) {
        const { summary } = await hisabDoService.getCustomerLedgerTimeline(userId, c.id);
        balances[c.id] = summary.netBalance;
      }
      setCustomerBalances(balances);
    } catch (e) {
      console.error("Error loading customers:", e);
      setLoadError(getFriendlyError(e));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add / Edit submit

const handleSaveCustomer = async (values: CustomerFormValues) => {
  if (!values.name.trim()) return;

  const phone = values.phone.trim();

  if (phone) {
    const parsedPhone = parsePhoneNumberFromString(phone);
    if (!parsedPhone || !parsedPhone.isValid()) {
      setPhoneError("Please enter a valid phone number with country code, e.g. +92 300 1234567");
      return;
    }
  }

  setPhoneError("");
  setSubmitting(true);

  const userId = user?.id || "guest";

  const customerData = {
    name: values.name.trim(),
    phone,
    email: values.email.trim(),
    address: values.address.trim(),
    opening_balance: Number(values.opening_balance || 0),
    notes: values.notes.trim(),
  };

  try {
    if (editingCustomer) {
      await hisabDoService.updateCustomer(
        userId,
        editingCustomer.id,
        customerData
      );
    } else {
      await hisabDoService.addCustomer(userId, {
        ...customerData,
        currency: "PKR",
      });
    }

    setIsAddModalOpen(false);
    setEditingCustomer(null);
    setPhoneError("");
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      opening_balance: 0,
      notes: "",
    });

    await loadData();
  } catch (e) {
    alert(getFriendlyError(e));
  } finally {
    setSubmitting(false);
  }
};

  // Record payment directly from customer list
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalCustomer || !paymentForm.amount) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      await hisabDoService.addLedgerTransaction(userId, {
        customerId: paymentModalCustomer.id,
        amount: Number(paymentForm.amount),
        type: paymentForm.type,
        category: paymentForm.category,
        date: new Date().toISOString(),
        note: paymentForm.note,
      });
      setPaymentModalCustomer(null);
      setPaymentForm({ amount: "", type: "received", category: "Cash", note: "" });
      await loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? All associated khata entries will remain archived.`)) {
      await hisabDoService.deleteCustomer(user?.id || "guest", id);
      await loadData();
    }
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
      opening_balance: c.opening_balance || 0,
      notes: c.notes || "",
    });
    setIsAddModalOpen(true);
  };

  // Filter & Search
const filteredCustomers = customers.filter((c) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const matchesSearch =
    c.name.toLowerCase().includes(normalizedSearch) ||
    (c.phone && c.phone.toLowerCase().includes(normalizedSearch)) ||
    (c.email && c.email.toLowerCase().includes(normalizedSearch));

  const balance = customerBalances[c.id] ?? c.opening_balance ?? 0;

  if (filterType === "receivable") return matchesSearch && balance > 0;
  if (filterType === "payable") return matchesSearch && balance < 0;
  if (filterType === "settled") return matchesSearch && balance === 0;

  return matchesSearch;
});

  // Calculate totals
  const totalReceivables = Object.values(customerBalances).reduce((sum, b) => (b > 0 ? sum + b : sum), 0);
  const totalPayables = Object.values(customerBalances).reduce((sum, b) => (b < 0 ? sum + Math.abs(b) : sum), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t("customers")}
          </h1>
          <p className="text-sm text-slate-400">
            Manage your party ledgers, credit limits, and WhatsApp reminders
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCustomer(null);
            setFormData({ name: "", phone: "", email: "", address: "", opening_balance: 0, notes: "" });
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00E676] hover:bg-[#00C853] text-[#0B0F17] font-bold text-sm rounded-xl transition shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addCustomer")}</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Parties</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black">{customers.length}</p>
          <span className="text-[11px] text-slate-400">Registered accounts</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total To Receive (Lene Hain)</span>
            <TrendingDown className="w-4 h-4 text-[#00E676]" />
          </div>
          <p className="text-2xl font-black text-[#00E676]">{formatMoney(totalReceivables)}</p>
          <span className="text-[11px] text-slate-400">Customers owe you</span>
        </div>

        <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total To Pay (Dene Hain)</span>
            <TrendingUp className="w-4 h-4 text-[#E53935]" />
          </div>
          <p className="text-2xl font-black text-[#E53935]">{formatMoney(totalPayables)}</p>
          <span className="text-[11px] text-slate-400">Advance or liability</span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <CustomerSearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterType={filterType}
        onFilterChange={setFilterType}
        customerCount={customers.length}
      />

      {/* Customer List / Table View */}
      {isLoading ? (
        <LoadingState message="Loading party ledger records..." />
      ) : loadError ? (
        <ErrorState
          title="Unable to load customers"
          message={loadError}
          onRetry={loadData}
        />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No parties found"
          message={
            searchTerm
              ? "No customers matched your search query."
              : "You have not added any customer or party yet."
          }
          action={
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#00E676] text-black font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add First Party
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const balance = customerBalances[c.id] ?? c.opening_balance ?? 0;

            const whatsappUrl = hisabDoService.generateWhatsAppReminderUrl({
              customerName: c.name,
              phone: c.phone,
              currency: currencySymbol,
              netBalance: balance,
              shopName: businessProfile.businessName || "HisabDo Store",
              shopPhone: businessProfile.phone || "",
            });

            return (
              <CustomerCard
                key={c.id}
                customer={c}
                balance={balance}
                formattedBalance={formatMoney(balance)}
                onEdit={handleOpenEdit}
                onDelete={(customer) =>
                  handleDeleteCustomer(customer.id, customer.name)
                }
                onRecordPayment={(customer) =>
                  setPaymentModalCustomer(customer)
                }
                whatsappUrl={whatsappUrl}
              />
            );
          })}
        </div>
      )}

      {/* ================= MODALS ================= */}

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            theme === "dark" ? "bg-[#1E1E1E] border-[#303030]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingCustomer ? "Edit Customer Details" : "Add New Customer / Party"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCustomer(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <CustomerForm
              initialValues={editingCustomer ?? undefined}
              onSubmit={handleSaveCustomer}
              onCancel={() => {
                setIsAddModalOpen(false);
                setEditingCustomer(null);
                setPhoneError("");
              }}
              isSubmitting={submitting}
              submitLabel={editingCustomer ? "Update Customer" : "Save Customer"}
              phoneError={phoneError}
              onPhoneChange={() => setPhoneError("")}
            />
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalCustomer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            theme === "dark" ? "bg-[#1E1E1E] border-[#303030]" : "bg-white border-slate-200"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Record Payment</h3>
                <p className="text-xs text-slate-400">For: {paymentModalCustomer.name}</p>
              </div>
              <button onClick={() => setPaymentModalCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Direction *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, type: "received" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      paymentForm.type === "received"
                        ? "bg-[#00E676] text-black border-[#00E676]"
                        : "border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Got Money (Wasool / Jama)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, type: "paid" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      paymentForm.type === "paid"
                        ? "bg-[#E53935] text-white border-[#E53935]"
                        : "border-slate-700 text-slate-400 hover:text-white"
                    }`}
                  >
                    Gave Money (Diya / Naam)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentForm.category}
                  onChange={(e) => setPaymentForm({ ...paymentForm, category: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none ${
                    theme === "dark" ? "bg-[#252525] border-slate-700" : "bg-white border-slate-200"
                  }`}
                >
                  <option value="Cash">Cash (Naqad)</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Easypaisa">Easypaisa</option>
                  <option value="JazzCash">JazzCash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Notes / Receipt Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Counter deposit, slip #910"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalCustomer(null)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition ${theme === "dark" ? "border-slate-700 hover:bg-slate-800/40 text-slate-300" : "border-slate-200 hover:bg-slate-100 text-slate-700"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-[#1A237E] text-white hover:bg-[#0D47A1] flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
