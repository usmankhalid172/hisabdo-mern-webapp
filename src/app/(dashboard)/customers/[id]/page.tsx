"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CustomerBalanceSummary } from "@/components/customer-ledger/CustomerBalanceSummary";
import { AddIncomeForm } from "@/components/transactions/AddIncomeForm";
import { AddExpenseForm } from "@/components/transactions/AddExpenseForm";
import { CustomerLedgerTable } from "@/components/customer-ledger/CustomerLedgerTable";
import { LedgerFeedback } from "@/components/customer-ledger/LedgerFeedback";
import {
  Mail,
  ArrowLeft,
  Phone,
  MapPin,
  Download,
  MessageCircle,
  MessageSquare,
  Plus,
  Minus,
  Search,
  Trash2,
  Edit2,
  X,
  Loader2,
  Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import {
  hisabDoService,
  Customer,
  LedgerRow,
} from "@/services/hisabdoService";

export default function CustomerLedgerPage() {
  const params = useParams();
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
  const [selectedFilter, setSelectedFilter] = useState<"all" | "income" | "expense">("all");

  // Reminder language
  const [reminderLang, setReminderLang] = useState<"ur-Roman" | "ur" | "en">("ur-Roman");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Edit/Delete
  const [editingRow, setEditingRow] = useState<LedgerRow | null>(null);
  const [deletingRow, setDeletingRow] = useState<LedgerRow | null>(null);
// Edit Form
const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    date: "",
    note: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Payment dialog (uses Aiman's shared form)
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Success/error feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-dismiss success feedback after 4 seconds
  useEffect(() => {
    if (feedback?.type === "success") {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

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
      setFeedback({ type: "success", message: "Entry updated successfully." });
      await loadLedger();
    } catch (e) {
      console.error("Update error:", e);
      setFeedback({ type: "error", message: "Entry update nahi hui. Dobara try karo." });
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
      setFeedback({ type: "success", message: "Entry deleted successfully." });
      await loadLedger();
    } catch (e) {
      console.error("Delete error:", e);
      setFeedback({ type: "error", message: "Entry delete nahi hui. Dobara try karo." });
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

  // Filter rows
  const filteredTimeline = timeline.filter((row) => {
    const matchesSearch =
      row.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.category.toLowerCase().includes(searchTerm.toLowerCase());

    const isIncomeType =
      row.type === "Purchase" ||
      row.type === "Payment Sent" ||
      row.rawType === "income" ||
      row.rawType === "paid";
    const isExpenseType =
      row.type === "Expense" ||
      row.type === "Payment Received" ||
      row.rawType === "expense" ||
      row.rawType === "received";

    if (selectedFilter === "income") return matchesSearch && isIncomeType;
    if (selectedFilter === "expense") return matchesSearch && isExpenseType;
    return matchesSearch;
  });

  const balance = summary.netBalance;

  if (isLoading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-success animate-spin" />
        <p className="text-xs text-muted-foreground">Loading customer khata ledger...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-foreground">Customer Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested customer could not be found or was removed.
        </p>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-control text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Customer Directory
        </Link>
      </div>
    );
  }

  // Reminder URLs
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
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-control border border-border hover:bg-surface-muted text-foreground transition"
            title="Back to Customers"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
              {customer.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-success" />
                {customer.phone || "No phone number"}
              </span>
              {customer.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {customer.address}
                </span>
              )}
               {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {customer.email}
                </span>
              )}
            </div>
              {customer.notes && (
                <p className="text-xs text-slate-400 mt-2">
                  Notes: {customer.notes}
                </p>
              )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-control text-xs font-bold transition border border-border bg-surface hover:bg-surface-muted text-foreground"
          >
            <Download className="w-4 h-4 text-success" />
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* ================= FEEDBACK ================= */}
      {feedback && (
        <LedgerFeedback
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* ================= ACTION BUTTONS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setIsIncomeModalOpen(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-card bg-success hover:opacity-90 text-white font-black text-base shadow-card transition transform active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span>+ Income (Lene / Wusooli)</span>
        </button>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex items-center justify-center gap-3 py-4 px-6 rounded-card bg-danger hover:opacity-90 text-white font-black text-base shadow-card transition transform active:scale-[0.99]"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Minus className="w-5 h-5 text-white" />
          </div>
          <span>- Expense (Dene / Adaigi)</span>
        </button>
      </div>

      {/* ================= SUMMARY (SHARED COMPONENT) ================= */}
      <CustomerBalanceSummary
        totalPurchases={summary.totalPurchases}
        totalPaymentsReceived={summary.totalPaymentsReceived}
        totalPaymentsSent={summary.totalPaymentsSent}
        netBalance={summary.netBalance}
        formatMoney={formatMoney}
      />

      {/* ================= FILTER CHIPS & SEARCH ================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-control text-xs font-bold transition ${
              selectedFilter === "all"
                ? "bg-success text-white shadow-card"
                : "bg-surface-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All (Sab)
          </button>
          <button
            onClick={() => setSelectedFilter("income")}
            className={`px-4 py-2 rounded-control text-xs font-bold transition ${
              selectedFilter === "income"
                ? "bg-success text-white shadow-card"
                : "bg-surface-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            Receivable (Wusooli)
          </button>
          <button
            onClick={() => setSelectedFilter("expense")}
            className={`px-4 py-2 rounded-control text-xs font-bold transition ${
              selectedFilter === "expense"
                ? "bg-danger text-white shadow-card"
                : "bg-surface-muted text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            Payable (Adaigi)
          </button>
        </div>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 ps-9 pe-3 py-2 rounded-control text-xs border border-border bg-surface text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* ================= LEDGER TABLE (SHARED COMPONENT) ================= */}
      <CustomerLedgerTable
        rows={filteredTimeline}
        formatMoney={formatMoney}
        onEdit={handleOpenEdit}
        onDelete={setDeletingRow}
      />

      {/* ================= FOLLOW-UP / SHARE DOCK ================= */}
      <div className="p-4 rounded-card border border-border bg-surface-muted">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Globe className="w-4 h-4 text-success" />
            <span className="text-xs font-semibold text-foreground">Reminder Language:</span>
            <div className="flex items-center gap-1 bg-surface p-1 rounded-control border border-border">
              <button
                type="button"
                onClick={() => setReminderLang("ur-Roman")}
                className={`px-2.5 py-1 rounded-control text-xs font-bold transition ${
                  reminderLang === "ur-Roman"
                    ? "bg-success text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Roman Urdu
              </button>
              <button
                type="button"
                onClick={() => setReminderLang("ur")}
                className={`px-2.5 py-1 rounded-control text-xs font-bold transition ${
                  reminderLang === "ur"
                    ? "bg-success text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                اردو
              </button>
              <button
                type="button"
                onClick={() => setReminderLang("en")}
                className={`px-2.5 py-1 rounded-control text-xs font-bold transition ${
                  reminderLang === "en"
                    ? "bg-success text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                English
              </button>
            </div>
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs text-info underline hover:opacity-80 ms-2"
            >
              Preview Message
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {customer.phone ? (
              <>
                <a
                  href={smsUrl}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-info hover:opacity-90 text-white font-bold text-xs shadow-card transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send SMS</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-control bg-success hover:opacity-90 text-white font-bold text-xs shadow-card transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp</span>
                </a>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">
                Add phone number to customer to enable WhatsApp and SMS reminders
              </span>
            )}
          </div>
        </div>
      </div>

{/* ================= MODALS ================= */}

      {/* Reusable Add Income Form */}
      <AddIncomeForm
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSuccess={loadLedger}
        customerId={customer?.id}
        lockCustomer={true}
        customers={customer ? [customer] : []}
      />

      {/* Reusable Add Expense Form */}
      <AddExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSuccess={loadLedger}
        customerId={customer?.id}
        lockCustomer={true}
        customers={customer ? [customer] : []}
      />

      {/* Modal 3: Edit Entry */}
{editingRow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-border p-6 space-y-4 shadow-card bg-surface text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-info" /> Edit Ledger Entry
              </h3>
              <button onClick={() => setEditingRow(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-3 py-2 text-lg font-bold rounded-control border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-control text-sm border border-border bg-surface text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-control text-sm border border-border bg-surface text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Note</label>
                <input
                  type="text"
                  value={editForm.note}
                  onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-control text-sm border border-border bg-surface text-foreground focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRow(null)}
                  className="flex-1 py-2.5 rounded-control text-sm font-semibold border border-border hover:bg-surface-muted text-foreground transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-control text-sm font-bold bg-primary hover:opacity-90 text-white flex items-center justify-center gap-2 transition"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ================= */}
      {deletingRow && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-card border border-border p-6 space-y-4 shadow-card text-center bg-surface text-foreground">
            <div className="w-12 h-12 rounded-full bg-danger/10 text-danger mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Delete Ledger Record</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to delete this record ({formatMoney(deletingRow.amount)})? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRow(null)}
                className="flex-1 py-2.5 rounded-control text-sm font-semibold border border-border hover:bg-surface-muted text-foreground transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-control text-sm font-bold bg-danger hover:opacity-90 text-white flex items-center justify-center gap-2 transition"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: MESSAGE PREVIEW ================= */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-card border border-border p-6 space-y-4 shadow-card bg-surface text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-success" />
                Reminder Message Preview ({reminderLang})
              </h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 rounded-control border border-border text-sm whitespace-pre-wrap leading-relaxed font-sans bg-surface-muted text-foreground">
              {previewMessage}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-control text-xs font-bold bg-primary hover:opacity-90 text-white transition"
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