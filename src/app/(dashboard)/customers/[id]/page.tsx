"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Mail,
  Download,
  MessageCircle,
  MessageSquare,
  Plus,
  Minus,
  Receipt,
  Calendar,
  Search,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Loader2,
  Share2,
  Globe,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  hisabDoService,
  Customer,
  LedgerRow,
} from "@/services/hisabdoService";

// Standard categories matching HisabDo Flutter Mobile App
const INCOME_CATEGORIES = ["Sales", "Salary", "Gift", "Other"];
const EXPENSE_CATEGORIES = ["Rent", "Food", "Transport", "Bills", "Shopping", "Other"];

export default function CustomerLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const { user } = useAuth();
  const { formatMoney, currencySymbol, theme, businessProfile } = useSettings();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [timeline, setTimeline] = useState<LedgerRow[]>([]);
  const [summary, setSummary] = useState({
    totalPurchases: 0,
    totalPaymentsReceived: 0,
    totalPaymentsSent: 0,
    netBalance: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // Ledger filter chips matching mobile: all, income (receivable), expense (payable)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "income" | "expense">("all");

  // Multi-language preference for WhatsApp / SMS reminder
  const [reminderLang, setReminderLang] = useState<"ur-Roman" | "ur" | "en">("ur-Roman");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Modals
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<LedgerRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<LedgerRow | null>(null);

  // Add Income Form (Lene / Wusooli)
  const [incomeForm, setIncomeForm] = useState({
    amount: "",
    category: "Sales",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  // Add Expense Form (Dene / Adaigi)
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "Rent",
    date: new Date().toISOString().split("T")[0],
    note: "",
  });

  // Edit Form
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    date: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const loadLedger = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || "guest";
      const custs = await hisabDoService.getCustomers(userId);
      const current = custs.find((c) => c.id === customerId);

      if (!current) {
        setIsLoading(false);
        return;
      }

      setCustomer(current);
      const ledgerData = await hisabDoService.getCustomerLedgerTimeline(userId, customerId);
      setTimeline(ledgerData.rows);
      setSummary(ledgerData.summary);
    } catch (e) {
      console.error("Error loading ledger:", e);
    } finally {
      setIsLoading(false);
    }
  }, [user, customerId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  // Submit Income (+ Lene / Wusooli)
  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.amount || !customer) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      await hisabDoService.addIncome(userId, {
        amount: Number(incomeForm.amount),
        customer_id: customer.id,
        category_id: incomeForm.category,
        description: incomeForm.note || `${incomeForm.category} Income`,
        payment_method: "cash",
        income_date: incomeForm.date,
      });
      setIsIncomeModalOpen(false);
      setIncomeForm({
        amount: "",
        category: "Sales",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      await loadLedger();
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Expense (- Dene / Adaigi)
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !customer) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      await hisabDoService.addExpense(userId, {
        amount: Number(expenseForm.amount),
        customer_id: customer.id,
        category_id: expenseForm.category,
        description: expenseForm.note || `${expenseForm.category} Expense`,
        payment_method: "cash",
        expense_date: expenseForm.date,
      });
      setIsExpenseModalOpen(false);
      setExpenseForm({
        amount: "",
        category: "Rent",
        date: new Date().toISOString().split("T")[0],
        note: "",
      });
      await loadLedger();
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (row: LedgerRow) => {
    setEditingRow(row);
    setEditForm({
      amount: String(row.amount),
      category: row.category,
      date: row.date.split("T")[0],
      note: row.note,
    });
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow || !editForm.amount) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      const updatedAmount = Number(editForm.amount);
      if (editingRow.sourceTable === "income") {
        await hisabDoService.updateIncome(userId, editingRow.id, {
          amount: updatedAmount,
          category_id: editForm.category,
          description: editForm.note,
          income_date: editForm.date,
        });
      } else if (editingRow.sourceTable === "expenses") {
        await hisabDoService.updateExpense(userId, editingRow.id, {
          amount: updatedAmount,
          category_id: editForm.category,
          description: editForm.note,
          expense_date: editForm.date,
        });
      } else if (editingRow.sourceTable === "ledger_transactions") {
        await hisabDoService.updateLedgerTransaction(userId, editingRow.id, {
          amount: updatedAmount,
          category: editForm.category,
          note: editForm.note,
          date: editForm.date,
        });
      }
      setEditingRow(null);
      await loadLedger();
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingRow) return;
    setSubmitting(true);
    const userId = user?.id || "guest";
    try {
      if (deletingRow.sourceTable === "income") {
        await hisabDoService.deleteIncome(userId, deletingRow.id);
      } else if (deletingRow.sourceTable === "expenses") {
        await hisabDoService.deleteExpense(userId, deletingRow.id);
      } else if (deletingRow.sourceTable === "ledger_transactions") {
        await hisabDoService.deleteLedgerTransaction(userId, deletingRow.id);
      }
      setDeletingRow(null);
      await loadLedger();
    } finally {
      setSubmitting(false);
    }
  };

  // Export PDF
  const handleDownloadPDF = () => {
    if (!customer) return;
    hisabDoService.generateStatementPDF({
      businessName: businessProfile.businessName || "HisabDo Enterprise",
      businessAddress: businessProfile.address || "Main Market, Commercial Center",
      businessPhone: businessProfile.phone || "",
      customer,
      timeline,
      summary,
      currency: currencySymbol,
    });
  };

  // Filter rows matching mobile LedgerFilter (all, income, expense)
  const filteredTimeline = timeline.filter((row) => {
    const matchesSearch =
      row.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase());

    const isIncomeType = row.type === "Purchase" || row.type === "Payment Sent" || row.rawType === "income";
    const isExpenseType = row.type === "Expense" || row.type === "Payment Received" || row.rawType === "expense";

    if (selectedFilter === "income") return matchesSearch && isIncomeType;
    if (selectedFilter === "expense") return matchesSearch && isExpenseType;
    return matchesSearch;
  });

  // Calculate dynamic totals for the customer ledger
  const totalLene = summary.totalPurchases + summary.totalPaymentsSent;
  const totalDene = summary.totalPaymentsReceived;
  const balance = summary.netBalance;
  const isReceivable = balance >= 0;

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#00E676] animate-spin" />
        <p className="text-xs text-slate-400">Loading customer khata ledger...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Customer Not Found</h2>
        <p className="text-sm text-slate-400">The requested customer could not be found or was removed.</p>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A237E] text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Customer Directory
        </Link>
      </div>
    );
  }

  // Pre-calculated reminder URLs and message
  const whatsappUrl = hisabDoService.generateWhatsAppReminderUrl({
    customerName: customer.name,
    phone: customer.phone,
    currency: currencySymbol,
    netBalance: balance,
    shopName: businessProfile.businessName || "HisabDo Store",
    shopPhone: businessProfile.phone || "",
    language: reminderLang,
    totalPurchases: summary.totalPurchases,
    totalPayments: summary.totalPaymentsReceived,
  });

  const smsUrl = hisabDoService.generateSmsReminderUrl({
    customerName: customer.name,
    phone: customer.phone,
    currency: currencySymbol,
    netBalance: balance,
    shopName: businessProfile.businessName || "HisabDo Store",
    shopPhone: businessProfile.phone || "",
    language: reminderLang,
  });

  const previewMessage = hisabDoService.getReminderMessage({
    customerName: customer.name,
    currency: currencySymbol,
    netBalance: balance,
    shopName: businessProfile.businessName || "HisabDo Store",
    shopPhone: businessProfile.phone || "",
    language: reminderLang,
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Top Navigation & Customer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title="Back to Customers"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              {customer.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                {customer.phone || "No phone number"}
              </span>
              {customer.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {customer.address}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Header: Download PDF */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1E1E1E] hover:bg-[#2A2A2A] text-slate-200 border border-slate-700 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* ================= TOP PROMINENT ACTION BUTTONS (MATCHING MOBILE APP) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Green + Income Button */}
        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#2E7D32] hover:bg-[#256628] text-white font-black text-base shadow-lg shadow-emerald-900/30 transition transform active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span>+ Income (Lene / Wusooli)</span>
        </button>

        {/* Red - Expense Button */}
        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-[#C62828] hover:bg-[#A82020] text-white font-black text-base shadow-lg shadow-rose-900/30 transition transform active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Minus className="w-5 h-5 text-white" />
          </div>
          <span>- Expense (Dene / Adaigi)</span>
        </button>
      </div>

      {/* ================= SUMMARY CARD (MATCHING MOBILE APP) ================= */}
      <div className={`p-6 rounded-2xl border ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
          {/* + Income */}
          <div className="pt-2 sm:pt-0">
            <span className="text-xs font-bold text-slate-400 block mb-1">+ Income (Lene / Receivable)</span>
            <span className="text-2xl font-black text-[#00E676]">{formatMoney(totalLene)}</span>
          </div>

          {/* - Expense */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs font-bold text-slate-400 block mb-1">- Expense (Dene / Paid)</span>
            <span className="text-2xl font-black text-[#E53935]">{formatMoney(totalDene)}</span>
          </div>

          {/* Net Balance */}
          <div className="pt-4 sm:pt-0 sm:px-4">
            <span className="text-xs font-bold text-slate-400 block mb-1">Net Balance (Khata Hisab)</span>
            <span className={`text-2xl font-black ${
              isReceivable ? "text-[#00E676]" : "text-[#E53935]"
            }`}>
              {formatMoney(balance)}
            </span>
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mt-1 ${
              isReceivable
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {isReceivable ? "Baqaya Lene Hain" : "Advance Jama Hain"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= FILTER CHIPS & SEARCH (MATCHING MOBILE APP) ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Choice Chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedFilter === "all"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-[#1E1E1E] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All (Sab)
          </button>
          <button
            onClick={() => setSelectedFilter("income")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedFilter === "income"
                ? "bg-[#2E7D32] text-white shadow-md shadow-emerald-900/40"
                : "bg-[#1E1E1E] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Receivable (Wusooli)
          </button>
          <button
            onClick={() => setSelectedFilter("expense")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              selectedFilter === "expense"
                ? "bg-[#C62828] text-white shadow-md shadow-rose-900/40"
                : "bg-[#1E1E1E] text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            Payable (Adaigi)
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 bg-[#1E1E1E] text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* ================= LEDGER TRANSACTION ENTRIES ================= */}
      <div className={`rounded-2xl border overflow-hidden ${
        theme === "dark" ? "bg-[#1E1E1E] border-[#2E2E2E]" : "bg-white border-slate-200 shadow-sm"
      }`}>
        {filteredTimeline.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Receipt className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p>No ledger entries found matching your filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredTimeline.map((row) => {
              const isIncomeRow = row.type === "Purchase" || row.type === "Payment Sent" || row.rawType === "income";

              return (
                <div
                  key={row.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                >
                  {/* Left: Direction Icon + Category & Note */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isIncomeRow ? "bg-emerald-500/20 text-[#00E676]" : "bg-rose-500/20 text-[#E53935]"
                      }`}
                    >
                      {isIncomeRow ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{row.category}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isIncomeRow
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}>
                          {isIncomeRow ? "Income" : "Expense"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{row.note}</p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {new Date(row.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount, Running Balance, and Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-base font-black block ${
                          isIncomeRow ? "text-[#00E676]" : "text-[#E53935]"
                        }`}
                      >
                        {isIncomeRow ? "+" : "-"}
                        {formatMoney(row.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Bal: {formatMoney(row.runningBalance)}
                      </span>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                      <button
                        onClick={() => handleOpenEdit(row)}
                        title="Edit entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingRow(row)}
                        title="Delete entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= BOTTOM FOLLOW-UP / SHARE DOCK (MATCHING MOBILE APP) ================= */}
      <div className={`p-4 rounded-2xl border ${
        theme === "dark" ? "bg-[#161B26] border-[#2A3447]" : "bg-slate-50 border-slate-300"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Reminder Language:</span>
            <div className="flex items-center gap-1 bg-[#0F141E] p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setReminderLang("ur-Roman")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  reminderLang === "ur-Roman" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                Roman Urdu
              </button>
              <button
                type="button"
                onClick={() => setReminderLang("ur")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  reminderLang === "ur" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setReminderLang("en")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  reminderLang === "en" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
                }`}
              >
                English
              </button>
            </div>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-indigo-400 underline hover:text-indigo-300 ml-2"
            >
              Preview Message
            </button>
          </div>

          {/* WhatsApp & SMS Action Buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {customer.phone ? (
              <>
                {/* SMS Button */}
                <a
                  href={smsUrl}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold text-xs shadow-md transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send SMS</span>
                </a>

                {/* WhatsApp Button */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#144717] text-white font-bold text-xs shadow-md transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp</span>
                </a>
              </>
            ) : (
              <span className="text-xs text-slate-500 italic">
                Add phone number to customer to enable WhatsApp and SMS reminders
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* Modal 1: + Add Income (Lene / Wusooli) */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#00E676] flex items-center gap-2">
                  <Plus className="w-5 h-5" /> Add Income (Lene / Wusooli)
                </h3>
                <p className="text-xs text-slate-400">Customer: {customer.name}</p>
              </div>
              <button onClick={() => setIsIncomeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 text-xl font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  {INCOME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                </input>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Cleared bill, partial advance"
                  value={incomeForm.note}
                  onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#2E7D32] hover:bg-[#256628] text-white flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: - Add Expense (Dene / Adaigi) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#E53935] flex items-center gap-2">
                  <Minus className="w-5 h-5" /> Add Expense (Dene / Adaigi)
                </h3>
                <p className="text-xs text-slate-400">Customer: {customer.name}</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  className="w-full px-3 py-2.5 text-xl font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Stock goods credit, returned items"
                  value={expenseForm.note}
                  onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-[#C62828] hover:bg-[#A82020] text-white flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Entry */}
      {editingRow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-400" /> Edit Ledger Entry
              </h3>
              <button onClick={() => setEditingRow(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold rounded-xl border border-slate-700 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Note</label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-700 bg-[#121212] text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Confirm Delete Dialog (Matching Mobile App) */}
      {deletingRow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Ledger Record</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to delete this record ({formatMoney(deletingRow.amount)})? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRow(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Message Preview */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#1E1E1E] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Reminder Message Preview ({reminderLang})
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#121212] border border-slate-800 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-sans">
              {previewMessage}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
