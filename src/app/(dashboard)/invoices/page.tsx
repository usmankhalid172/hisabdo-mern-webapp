"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Download,
  Printer,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  User,
  Calendar,
  DollarSign,
  ShieldCheck,
  Search,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { hisabDoService, Customer } from "@/services/hisabdoService";
import { subscriptionService, EntitlementUsage } from "@/services/subscriptionService";
import { UpgradeProModal } from "@/components/UpgradeProModal";

export interface InvoiceLineItem {
  id: string;
  name: string;
  category: string;
  type: "income" | "expense";
  quantity: number;
  unitPrice: number;
  amount: number;
  note?: string;
}

export interface StoredInvoice {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  businessName: string;
  date: string;
  dueDate: string;
  status: "paid" | "pending" | "overdue";
  items: InvoiceLineItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const { businessProfile, theme, currency } = useSettings();
  const userId = user?.id || "guest";

  const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Usage & Upgrade Modal
  const [invoiceUsage, setInvoiceUsage] = useState<EntitlementUsage>(
    subscriptionService.getUsage(userId, "invoice_create")
  );
  const [pdfUsage, setPdfUsage] = useState<EntitlementUsage>(
    subscriptionService.getUsage(userId, "invoice_pdf")
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState("Invoices");

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [invoiceStatus, setInvoiceStatus] = useState<"paid" | "pending" | "overdue">("pending");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [notes, setNotes] = useState("Thank you for your business. Please clear dues before the due date.");

  const [items, setItems] = useState<InvoiceLineItem[]>([
    {
      id: "item-1",
      name: "Commercial Merchandise / Goods",
      category: "Sales",
      type: "income",
      quantity: 1,
      unitPrice: 5000,
      amount: 5000,
      note: "Standard delivery",
    },
  ]);

  // Load Invoices and Customers
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    const custs = await hisabDoService.getCustomers(userId);
    setCustomers(custs);

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`hisabdo_${userId}_invoices`);
        if (stored) {
          setInvoices(JSON.parse(stored));
        } else {
          // Initial sample invoice
          const sample: StoredInvoice = {
            id: "inv-sample-1",
            invoiceNumber: "INV-202609-1001",
            customerName: custs[0]?.name || "Ahmed Trading Co.",
            customerPhone: custs[0]?.phone || "0300-1234567",
            businessName: businessProfile.businessName || "HisabDo Enterprise",
            date: new Date().toISOString().split("T")[0],
            dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
            status: "pending",
            items: [
              {
                id: "item-s1",
                name: "Wholesale Grocery Stock",
                category: "Sales",
                type: "income",
                quantity: 10,
                unitPrice: 1500,
                amount: 15000,
                note: "Batch #410",
              },
            ],
            subtotal: 15000,
            discount: 0,
            tax: 0,
            total: 15000,
            notes: "Goods delivered in good condition.",
            createdAt: new Date().toISOString(),
          };
          setInvoices([sample]);
          localStorage.setItem(`hisabdo_${userId}_invoices`, JSON.stringify([sample]));
        }
      } catch {}
    }

    refreshUsage();
  };

  const refreshUsage = () => {
    setInvoiceUsage(subscriptionService.getUsage(userId, "invoice_create"));
    setPdfUsage(subscriptionService.getUsage(userId, "invoice_pdf"));
  };

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
      setCustomerPhone(found.phone || "");
    }
  };

  const handleAddItem = () => {
    const newItem: InvoiceLineItem = {
      id: "item-" + Date.now(),
      name: "",
      category: "Sales",
      type: "income",
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof InvoiceLineItem, val: any) => {
    const updated = [...items];
    const target = { ...updated[index], [field]: val };
    if (field === "quantity" || field === "unitPrice") {
      const q = field === "quantity" ? Number(val) : target.quantity;
      const p = field === "unitPrice" ? Number(val) : target.unitPrice;
      target.amount = Math.max(0, q * p);
    }
    updated[index] = target;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const taxable = Math.max(0, subtotal - discountAmount);
  const taxAmount = (taxable * (taxPercent || 0)) / 100;
  const grandTotal = taxable + taxAmount;

  // Save Invoice
  const handleSaveInvoice = () => {
    if (!customerName.trim()) {
      alert("Please specify a customer name.");
      return;
    }

    // Check free limit entitlement
    if (!subscriptionService.canPerform(userId, "invoice_create")) {
      setUpgradeFeatureName("Invoices");
      setUpgradeModalOpen(true);
      return;
    }

    const newInv: StoredInvoice = {
      id: "inv-" + Date.now(),
      invoiceNumber,
      customerId: selectedCustomerId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      businessName: businessProfile.businessName || "HisabDo Enterprise",
      date: invoiceDate,
      dueDate,
      status: invoiceStatus,
      items,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      notes,
      createdAt: new Date().toISOString(),
    };

    const updated = [newInv, ...invoices];
    setInvoices(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`hisabdo_${userId}_invoices`, JSON.stringify(updated));
    }

    // Increment usage
    subscriptionService.incrementUsage(userId, "invoice_create");
    refreshUsage();

    setActiveTab("list");
    // Reset form
    setInvoiceNumber(
      `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(
        1000 + Math.random() * 9000
      )}`
    );
  };

  // Export PDF matching mobile InvoicePdfService
  const handleExportPdf = (inv: StoredInvoice) => {
    // Check PDF export entitlement
    if (!subscriptionService.canPerform(userId, "invoice_pdf")) {
      setUpgradeFeatureName("PDF Statement Exports");
      setUpgradeModalOpen(true);
      return;
    }

    try {
      const doc = new jsPDF();

      // Top Indigo Header Banner
      doc.setFillColor(26, 35, 126); // #1A237E
      doc.rect(0, 0, 210, 36, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(inv.businessName || "HisabDo Enterprise", 14, 18);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(
        `${businessProfile.address || "Main Commercial Market, Lahore, Pakistan"}  |  ${
          businessProfile.phone || "0300-1234567"
        }`,
        14,
        26
      );

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("INVOICE", 196, 18, { align: "right" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(inv.invoiceNumber, 196, 26, { align: "right" });

      // Invoice Details & Billed To
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("BILLED TO:", 14, 46);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(inv.customerName, 14, 53);
      if (inv.customerPhone) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`Phone: ${inv.customerPhone}`, 14, 59);
      }

      // Meta Dates Right Side
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(`Invoice Date: ${inv.date}`, 196, 46, { align: "right" });
      doc.text(`Due Date: ${inv.dueDate}`, 196, 52, { align: "right" });
      doc.text(
        `Status: ${inv.status.toUpperCase()}`,
        196,
        58,
        { align: "right" }
      );

      // Line Items Table
      const tableData = inv.items.map((item, idx) => [
        idx + 1,
        item.name,
        item.category,
        item.type === "income" ? "Sale / Income" : "Expense",
        item.quantity,
        `${currency} ${Number(item.unitPrice).toLocaleString()}`,
        `${currency} ${Number(item.amount).toLocaleString()}`,
      ]);

      autoTable(doc, {
        startY: 68,
        head: [["#", "Item Description", "Category", "Type", "Qty", "Unit Price", "Total Amount"]],
        body: tableData,
        theme: "striped",
        headStyles: {
          fillColor: [26, 35, 126],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3.5,
        },
      });

      // Totals Box
      const finalY = (doc as any).lastAutoTable.finalY + 8;

      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(`Subtotal:`, 140, finalY);
      doc.text(`${currency} ${Number(inv.subtotal).toLocaleString()}`, 196, finalY, { align: "right" });

      if (inv.discount > 0) {
        doc.text(`Discount:`, 140, finalY + 6);
        doc.text(`- ${currency} ${Number(inv.discount).toLocaleString()}`, 196, finalY + 6, { align: "right" });
      }

      if (inv.tax > 0) {
        doc.text(`Tax / GST:`, 140, finalY + 12);
        doc.text(`+ ${currency} ${Number(inv.tax).toLocaleString()}`, 196, finalY + 12, { align: "right" });
      }

      // Grand Total Bar
      doc.setFillColor(240, 243, 255);
      doc.rect(136, finalY + 16, 64, 10, "F");
      doc.setTextColor(26, 35, 126);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`Grand Total:`, 140, finalY + 23);
      doc.text(`${currency} ${Number(inv.total).toLocaleString()}`, 196, finalY + 23, { align: "right" });

      // Notes / Footer
      if (inv.notes) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont("helvetica", "italic");
        doc.text(`Note: ${inv.notes}`, 14, finalY + 36);
      }

      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.setFont("helvetica", "normal");
      doc.text("Generated with HisabDo - Digital Khata & Invoicing System", 105, 285, { align: "center" });

      doc.save(`${inv.invoiceNumber}_${inv.customerName.replace(/\s+/g, "_")}.pdf`);

      // Increment PDF usage
      subscriptionService.incrementUsage(userId, "invoice_pdf");
      refreshUsage();
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("Failed to export PDF invoice.");
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#1A237E]/40 to-[#311B92]/30 border border-indigo-500/20 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">Invoices & PDF Bills</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Generate itemized retail invoices, record customer sales, and download branded PDF statements.
          </p>
        </div>

        {/* Action & Usage Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
            <span className="text-slate-400">Daily Invoices:</span>
            <span className={`font-bold ${invoiceUsage.isUnlimited ? "text-emerald-400" : "text-indigo-400"}`}>
              {invoiceUsage.isUnlimited ? "Unlimited" : `${invoiceUsage.used}/${invoiceUsage.limit}`}
            </span>
          </div>

          <div className="bg-[#111726] border border-slate-800 rounded-xl px-3 py-2 text-xs flex items-center gap-2">
            <span className="text-slate-400">Daily PDFs:</span>
            <span className={`font-bold ${pdfUsage.isUnlimited ? "text-emerald-400" : "text-indigo-400"}`}>
              {pdfUsage.isUnlimited ? "Unlimited" : `${pdfUsage.used}/${pdfUsage.limit}`}
            </span>
          </div>

          {activeTab === "list" ? (
            <button
              onClick={() => setActiveTab("create")}
              className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              New Invoice
            </button>
          ) : (
            <button
              onClick={() => setActiveTab("list")}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm transition-all"
            >
              Back to Invoices
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center gap-3 bg-[#111726]/80 border border-slate-800/80 px-4 py-2.5 rounded-xl">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoices by customer name or invoice number..."
              className="bg-transparent flex-1 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Invoices List */}
          <div className="rounded-2xl border border-slate-800/80 bg-[#111726]/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-xs uppercase text-slate-400 bg-slate-900/60">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Total Amount</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-indigo-400">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-white">{inv.customerName}</p>
                          {inv.customerPhone && (
                            <span className="text-xs text-slate-500">{inv.customerPhone}</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-400 text-xs">{inv.date}</td>
                        <td className="py-4 px-4 text-slate-400 text-xs">{inv.dueDate}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                              inv.status === "paid"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : inv.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {inv.status === "paid" && <CheckCircle className="w-3 h-3" />}
                            {inv.status === "pending" && <Clock className="w-3 h-3" />}
                            {inv.status === "overdue" && <AlertCircle className="w-3 h-3" />}
                            {inv.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-white text-base">
                          {currency} {Number(inv.total).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleExportPdf(inv)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No invoices found. Click "New Invoice" to create your first bill.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Create Invoice Form */
        <div className="rounded-2xl border border-slate-800/80 bg-[#111726]/80 p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">Create New Bill / Invoice</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in customer details and line items to generate and print.
            </p>
          </div>

          {/* Invoice Header Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Select Customer (Khata)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose Existing or Type Below --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone || "No Phone"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Customer Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="0300-1234567"
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Payment Status</label>
              <select
                value={invoiceStatus}
                onChange={(e) => setInvoiceStatus(e.target.value as any)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Itemized Products & Charges</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="py-1 px-3 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#182032] text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 w-20">Qty</th>
                    <th className="py-2.5 px-3 w-28">Unit Price</th>
                    <th className="py-2.5 px-3 w-28 text-right">Amount</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-800/20">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(index, "name", e.target.value)}
                          placeholder="Item or service name..."
                          className="w-full bg-[#111726] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateItem(index, "category", e.target.value)}
                          placeholder="Category"
                          className="w-full bg-[#111726] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateItem(index, "type", e.target.value)}
                          className="w-full bg-[#111726] border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="income">Sale / Income</option>
                          <option value="expense">Expense / Cost</option>
                        </select>
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(index, "quantity", e.target.value)}
                          className="w-full bg-[#111726] border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateItem(index, "unitPrice", e.target.value)}
                          className="w-full bg-[#111726] border border-slate-700/60 rounded-lg px-2 py-1.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {currency} {Number(item.amount).toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={items.length <= 1}
                          className="text-slate-500 hover:text-rose-400 disabled:opacity-30 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Invoice Terms & Payment Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#182032] border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="bg-[#182032]/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal:</span>
                <span className="text-white font-medium">
                  {currency} {subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">Discount %:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-16 bg-[#111726] border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-white"
                  />
                  <span className="text-rose-400 font-medium">
                    - {currency} {discountAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">Tax / GST %:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-16 bg-[#111726] border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-white"
                  />
                  <span className="text-emerald-400 font-medium">
                    + {currency} {taxAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-2 flex justify-between items-baseline text-sm">
                <span className="font-bold text-white">Grand Total:</span>
                <span className="text-xl font-extrabold text-emerald-400">
                  {currency} {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("list")}
              className="py-2.5 px-5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveInvoice}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
            >
              Save & Finalize Invoice
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Pro Modal */}
      <UpgradeProModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        userId={userId}
        featureName={upgradeFeatureName}
        onUpgraded={() => {
          refreshUsage();
          alert("🎉 Congratulations! You have unlocked HisabDo Pro with unlimited invoices and PDF exports.");
        }}
      />
    </div>
  );
}
