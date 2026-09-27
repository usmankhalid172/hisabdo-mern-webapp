"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
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
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";

export default function CustomersPage() {
  const { user } = useAuth();
  const { formatMoney, currencySymbol, theme, t, businessProfile } = useSettings();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerBalances, setCustomerBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add / Edit submit
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      if (editingCustomer) {
        await hisabDoService.updateCustomer(userId, editingCustomer.id, formData);
      } else {
        await hisabDoService.addCustomer(userId, {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          opening_balance: Number(formData.opening_balance || 0),
          currency: "PKR",
          notes: formData.notes,
        });
      }
      setIsAddModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: "", phone: "", email: "", address: "", opening_balance: 0, notes: "" });
      await loadData();
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
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));

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
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
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
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("searchCustomer")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
              theme === "dark" ? "bg-[#252525] border-[#353535] text-white" : "bg-slate-50 border-slate-200"
            }`}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === "all"
                ? "bg-[#1A237E] text-white"
                : theme === "dark"
                ? "text-slate-400 hover:bg-[#252525]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Parties ({customers.length})
          </button>
          <button
            onClick={() => setFilterType("receivable")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === "receivable"
                ? "bg-emerald-500/20 text-[#00E676] border border-emerald-500/30"
                : theme === "dark"
                ? "text-slate-400 hover:bg-[#252525]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Lene Hain (Debit)
          </button>
          <button
            onClick={() => setFilterType("payable")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === "payable"
                ? "bg-rose-500/20 text-[#E53935] border border-rose-500/30"
                : theme === "dark"
                ? "text-slate-400 hover:bg-[#252525]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Dene Hain (Credit)
          </button>
          <button
            onClick={() => setFilterType("settled")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              filterType === "settled"
                ? "bg-slate-700 text-white"
                : theme === "dark"
                ? "text-slate-400 hover:bg-[#252525]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Settled (0)
          </button>
        </div>
      </div>

      {/* Customer List / Table View */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
          <p className="text-xs text-slate-400">Loading party ledger records...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"}`}>
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold">No parties found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {searchTerm ? "No customers matched your search query." : "You have not added any customer or party yet."}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 bg-[#00E676] text-black font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add First Party
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => {
            const balance = customerBalances[c.id] ?? c.opening_balance ?? 0;
            const isReceivable = balance > 0;
            const isPayable = balance < 0;

            const whatsappUrl = hisabDoService.generateWhatsAppReminderUrl({
              customerName: c.name,
              phone: c.phone,
              currency: currencySymbol,
              netBalance: balance,
              shopName: businessProfile.businessName || "HisabDo Store",
              shopPhone: businessProfile.phone || "",
            });

            return (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E] hover:border-slate-600" : "bg-white border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-900 to-indigo-700 text-white font-black text-sm flex items-center justify-center shrink-0">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <Link
                          href={`/customers/${c.id}`}
                          className="font-bold text-sm tracking-tight hover:underline block truncate"
                        >
                          {c.name}
                        </Link>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{c.phone || "No phone"}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 text-slate-400 hover:text-white rounded"
                        title="Edit Customer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(c.id, c.name)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {c.address && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-3 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{c.address}</span>
                    </p>
                  )}

                  {/* Balance Display */}
                  <div className={`p-3 rounded-xl border mt-3 flex items-center justify-between ${
                    theme === "dark" ? "bg-[#252525]/70 border-[#323232]" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Net Khata Balance
                      </span>
                      <span
                        className={`text-lg font-black tracking-tight ${
                          isReceivable
                            ? "text-[#00E676]"
                            : isPayable
                            ? "text-[#E53935]"
                            : "text-slate-400"
                        }`}
                      >
                        {formatMoney(balance)}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isReceivable
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : isPayable
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                      }`}
                    >
                      {isReceivable ? "Lene Hain" : isPayable ? "Dene Hain" : "Settled"}
                    </span>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-4 border-t border-slate-800/50 mt-4 flex items-center gap-2">
                  <Link
                    href={`/customers/${c.id}`}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-[#1A237E] hover:bg-[#0D47A1] text-white flex items-center justify-center gap-1.5 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Ledger</span>
                  </Link>

                  <button
                    onClick={() => {
                      setPaymentModalCustomer(c);
                    }}
                    className={`p-2 rounded-xl border transition ${
                      theme === "dark"
                        ? "bg-[#252525] border-[#353535] hover:bg-[#303030] text-slate-200"
                        : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
                    }`}
                    title="Record Payment"
                  >
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                  </button>

                  {c.phone && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 transition"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
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

            <form onSubmit={handleSaveCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Customer / Party Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Bashir Autos"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number (with country code)</label>
                <input
                  type="text"
                  placeholder="+92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Shop Address / Location</label>
                <input
                  type="text"
                  placeholder="Shop #, Market, City"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Opening Balance ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={formData.opening_balance || ""}
                  onChange={(e) => setFormData({ ...formData, opening_balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Notes / Terms</label>
                <textarea
                  placeholder="Credit term limit, special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-sm border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border hover:bg-slate-800/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl text-sm font-bold bg-[#00E676] text-black hover:bg-[#00C853] flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingCustomer ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
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
                  className="flex-1 py-2 rounded-xl text-sm font-semibold border hover:bg-slate-800/40"
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