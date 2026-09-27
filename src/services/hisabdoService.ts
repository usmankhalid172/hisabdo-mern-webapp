import { createClient } from "@/lib/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  opening_balance: number;
  currency: string;
  notes?: string;
  created_at: string;
}

export interface Income {
  id: string;
  amount: number;
  customer_id?: string | null;
  category_id?: string | null;
  income_date: string;
  description: string;
  payment_method: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  amount: number;
  customer_id?: string | null;
  category_id?: string | null;
  expense_date: string;
  description: string;
  payment_method: string;
  created_at?: string;
}

export interface LedgerTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: "received" | "paid"; // received = Jama (customer paid), paid = Naam (we paid)
  category: string;
  date: string;
  note?: string;
  imagePath?: string;
}

export interface LedgerRow {
  id: string;
  date: string;
  type: "Purchase" | "Expense" | "Payment Received" | "Payment Sent";
  rawType: "income" | "expense" | "received" | "paid";
  amount: number;
  note: string;
  category: string;
  runningBalance: number;
  sourceTable: "income" | "expenses" | "ledger_transactions";
}

// Clean empty initial state
const DEFAULT_CUSTOMERS: Customer[] = [];
const DEFAULT_INCOMES: Income[] = [];
const DEFAULT_EXPENSES: Expense[] = [];
const DEFAULT_LEDGER_TXS: LedgerTransaction[] = [];


export class HisabDoService {
  private getStorageKey(userId: string, key: string) {
    return `hisabdo_${userId || "guest"}_${key}`;
  }

  // Load state from local storage or defaults
  private getLocal<T>(userId: string, key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const data = localStorage.getItem(this.getStorageKey(userId, key));
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item: any) => {
          if (!item || !item.id) return true;
          const id = String(item.id);
          if (["cust-1", "cust-2", "cust-3", "cust-4", "cust-5"].includes(id)) return false;
          if (["inc-1", "inc-2", "inc-3", "inc-4", "inc-5"].includes(id)) return false;
          if (["exp-1", "exp-2", "exp-3", "exp-4", "exp-5"].includes(id)) return false;
          if (["ltx-1", "ltx-2", "ltx-3", "ltx-4", "ltx-5", "ltx-6", "ltx-7"].includes(id)) return false;
          return true;
        });
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(this.getStorageKey(userId, key), JSON.stringify(cleaned));
          return cleaned as unknown as T;
        }
      }
      return parsed;
    } catch {
      return fallback;
    }
  }

  private setLocal<T>(userId: string, key: string, val: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.getStorageKey(userId, key), JSON.stringify(val));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  }

  clearAllData(userId: string): void {
    if (typeof window === "undefined") return;
    try {
      const keys = ["customers", "incomes", "expenses", "ledger_txs"];
      for (const k of keys) {
        localStorage.removeItem(this.getStorageKey(userId, k));
        localStorage.removeItem(this.getStorageKey("guest", k));
        localStorage.removeItem(this.getStorageKey("demo-user-1", k));
      }
      localStorage.removeItem("hisabdo_customers");
      localStorage.removeItem("hisabdo_expenses");
      localStorage.removeItem("hisabdo_transactions");
    } catch {}
  }

  // ==================== CUSTOMERS ====================
  async getCustomers(userId: string): Promise<Customer[]> {
    const fallback = this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        this.setLocal(userId, "customers", data);
        return data as Customer[];
      }
    } catch {
      // Fallback to local
    }
    return fallback;
  }

  async addCustomer(userId: string, customer: Omit<Customer, "id" | "created_at">): Promise<Customer> {
    const newCust: Customer = {
      ...customer,
      id: "cust-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    // Try Supabase first
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("customers").insert([newCust]).select().single();
      if (!error && data) {
        newCust.id = data.id;
      }
    } catch {}

    const list = await this.getCustomers(userId);
    const updated = [newCust, ...list.filter((c) => c.id !== newCust.id)];
    this.setLocal(userId, "customers", updated);
    return newCust;
  }

  async updateCustomer(userId: string, id: string, updates: Partial<Customer>): Promise<Customer> {
    const list = await this.getCustomers(userId);
    let updatedCust: Customer | null = null;
    const updatedList = list.map((c) => {
      if (c.id === id) {
        updatedCust = { ...c, ...updates };
        return updatedCust;
      }
      return c;
    });

    try {
      const supabase = createClient();
      await supabase.from("customers").update(updates).eq("id", id);
    } catch {}

    if (updatedCust) {
      this.setLocal(userId, "customers", updatedList);
      return updatedCust;
    }
    throw new Error("Customer not found");
  }

  async deleteCustomer(userId: string, id: string): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("customers").delete().eq("id", id);
    } catch {}

    const list = await this.getCustomers(userId);
    this.setLocal(userId, "customers", list.filter((c) => c.id !== id));
  }

  // ==================== INCOMES ====================
  async getIncomes(userId: string): Promise<Income[]> {
    const fallback = this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("income").select("*").order("income_date", { ascending: false });
      if (!error && data && data.length > 0) {
        this.setLocal(userId, "incomes", data);
        return data as Income[];
      }
    } catch {}
    return fallback;
  }

  async addIncome(userId: string, income: Omit<Income, "id" | "created_at">): Promise<Income> {
    const newInc: Income = {
      ...income,
      id: "inc-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("income").insert([newInc]).select().single();
      if (!error && data) {
        newInc.id = data.id;
      }
    } catch {}

    const list = await this.getIncomes(userId);
    const updated = [newInc, ...list];
    this.setLocal(userId, "incomes", updated);
    return newInc;
  }

  async deleteIncome(userId: string, id: string): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("income").delete().eq("id", id);
    } catch {}

    const list = await this.getIncomes(userId);
    this.setLocal(userId, "incomes", list.filter((i) => i.id !== id));
  }

  async updateIncome(userId: string, id: string, updates: Partial<Income>): Promise<Income> {
    const list = await this.getIncomes(userId);
    let updatedItem: Income | null = null;
    const updatedList = list.map((i) => {
      if (i.id === id) {
        updatedItem = { ...i, ...updates };
        return updatedItem;
      }
      return i;
    });

    try {
      const supabase = createClient();
      await supabase.from("income").update(updates).eq("id", id);
    } catch {}

    if (updatedItem) {
      this.setLocal(userId, "incomes", updatedList);
      return updatedItem;
    }
    throw new Error("Income record not found");
  }

  // ==================== EXPENSES ====================
  async getExpenses(userId: string): Promise<Expense[]> {
    const fallback = this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
      if (!error && data && data.length > 0) {
        this.setLocal(userId, "expenses", data);
        return data as Expense[];
      }
    } catch {}
    return fallback;
  }

  async addExpense(userId: string, expense: Omit<Expense, "id" | "created_at">): Promise<Expense> {
    const newExp: Expense = {
      ...expense,
      id: "exp-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("expenses").insert([newExp]).select().single();
      if (!error && data) {
        newExp.id = data.id;
      }
    } catch {}

    const list = await this.getExpenses(userId);
    const updated = [newExp, ...list];
    this.setLocal(userId, "expenses", updated);
    return newExp;
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("expenses").delete().eq("id", id);
    } catch {}

    const list = await this.getExpenses(userId);
    this.setLocal(userId, "expenses", list.filter((e) => e.id !== id));
  }

  async updateExpense(userId: string, id: string, updates: Partial<Expense>): Promise<Expense> {
    const list = await this.getExpenses(userId);
    let updatedItem: Expense | null = null;
    const updatedList = list.map((e) => {
      if (e.id === id) {
        updatedItem = { ...e, ...updates };
        return updatedItem;
      }
      return e;
    });

    try {
      const supabase = createClient();
      await supabase.from("expenses").update(updates).eq("id", id);
    } catch {}

    if (updatedItem) {
      this.setLocal(userId, "expenses", updatedList);
      return updatedItem;
    }
    throw new Error("Expense record not found");
  }

  // ==================== DIRECT LEDGER PAYMENTS ====================
  async getLedgerTransactions(userId: string): Promise<LedgerTransaction[]> {
    const fallback = this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("ledger_transactions").select("*").order("date", { ascending: false });
      if (!error && data && data.length > 0) {
        this.setLocal(userId, "ledger_txs", data);
        return data as LedgerTransaction[];
      }
    } catch {}
    return fallback;
  }

  async addLedgerTransaction(userId: string, tx: Omit<LedgerTransaction, "id">): Promise<LedgerTransaction> {
    const newTx: LedgerTransaction = {
      ...tx,
      id: "ltx-" + Date.now(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("ledger_transactions").insert([newTx]).select().single();
      if (!error && data) {
        newTx.id = data.id;
      }
    } catch {}

    const list = await this.getLedgerTransactions(userId);
    const updated = [newTx, ...list];
    this.setLocal(userId, "ledger_txs", updated);
    return newTx;
  }

  async deleteLedgerTransaction(userId: string, id: string): Promise<void> {
    try {
      const supabase = createClient();
      await supabase.from("ledger_transactions").delete().eq("id", id);
    } catch {}

    const list = await this.getLedgerTransactions(userId);
    this.setLocal(userId, "ledger_txs", list.filter((t) => t.id !== id));
  }

  async updateLedgerTransaction(userId: string, id: string, updates: Partial<LedgerTransaction>): Promise<LedgerTransaction> {
    const list = await this.getLedgerTransactions(userId);
    let updatedItem: LedgerTransaction | null = null;
    const updatedList = list.map((t) => {
      if (t.id === id) {
        updatedItem = { ...t, ...updates };
        return updatedItem;
      }
      return t;
    });

    try {
      const supabase = createClient();
      await supabase.from("ledger_transactions").update(updates).eq("id", id);
    } catch {}

    if (updatedItem) {
      this.setLocal(userId, "ledger_txs", updatedList);
      return updatedItem;
    }
    throw new Error("Ledger transaction record not found");
  }

  // ==================== COMPUTED CUSTOMER LEDGER & RUNNING BALANCE ====================
  async getCustomerLedgerTimeline(userId: string, customerId: string): Promise<{ rows: LedgerRow[]; summary: { totalPurchases: number; totalPaymentsReceived: number; totalPaymentsSent: number; netBalance: number } }> {
    const [customers, incomes, expenses, payments] = await Promise.all([
      this.getCustomers(userId),
      this.getIncomes(userId),
      this.getExpenses(userId),
      this.getLedgerTransactions(userId),
    ]);

    const customer = customers.find((c) => c.id === customerId);
    const openingBalance = customer ? Number(customer.opening_balance || 0) : 0;

    type TempRow = {
      id: string;
      date: string;
      type: "Purchase" | "Expense" | "Payment Received" | "Payment Sent";
      rawType: "income" | "expense" | "received" | "paid";
      amount: number;
      note: string;
      category: string;
      sourceTable: "income" | "expenses" | "ledger_transactions";
    };

    const tempRows: TempRow[] = [];

    // 1. Incomes linked to this customer (Purchase by customer -> Customer owes us -> +)
    incomes
      .filter((i) => i.customer_id === customerId)
      .forEach((i) => {
        tempRows.push({
          id: i.id,
          date: i.income_date,
          type: "Purchase",
          rawType: "income",
          amount: Number(i.amount),
          note: i.description || "Purchase / Credit Sale",
          category: i.category_id || "Sales",
          sourceTable: "income",
        });
      });

    // 2. Expenses linked to this customer (Refund or purchase from customer -> -)
    expenses
      .filter((e) => e.customer_id === customerId)
      .forEach((e) => {
        tempRows.push({
          id: e.id,
          date: e.expense_date,
          type: "Expense",
          rawType: "expense",
          amount: Number(e.amount),
          note: e.description || "Expense / Return",
          category: e.category_id || "Expenses",
          sourceTable: "expenses",
        });
      });

    // 3. Direct Payments in Ledger
    payments
      .filter((p) => p.customerId === customerId)
      .forEach((p) => {
        tempRows.push({
          id: p.id,
          date: p.date,
          type: p.type === "received" ? "Payment Received" : "Payment Sent",
          rawType: p.type,
          amount: Number(p.amount),
          note: p.note || (p.type === "received" ? "Payment Received (Jama)" : "Payment Sent (Naam)"),
          category: p.category || "Payment",
          sourceTable: "ledger_transactions",
        });
      });

    // Sort chronologically ascending
    tempRows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let running = openingBalance;
    const finalRows: LedgerRow[] = [];

    for (const r of tempRows) {
      // 1:1 business logic parity with Flutter customer_ledger_screen.dart & whatsapp_message_service.dart:
      // Purchase -> +amount
      // Expense -> -amount
      // Payment Sent -> +amount
      // Payment Received -> -amount
      let delta = 0;
      if (r.type === "Purchase") delta = r.amount;
      else if (r.type === "Expense") delta = -r.amount;
      else if (r.type === "Payment Sent") delta = r.amount;
      else if (r.type === "Payment Received") delta = -r.amount;

      running += delta;

      finalRows.push({
        ...r,
        runningBalance: running,
      });
    }

    const totalPurchases = tempRows.filter((r) => r.type === "Purchase").reduce((acc, r) => acc + r.amount, 0);
    const totalPaymentsReceived = tempRows.filter((r) => r.type === "Payment Received").reduce((acc, r) => acc + r.amount, 0);
    const totalPaymentsSent = tempRows.filter((r) => r.type === "Payment Sent").reduce((acc, r) => acc + r.amount, 0);

    return {
      rows: finalRows.reverse(), // latest first for display
      summary: {
        totalPurchases,
        totalPaymentsReceived,
        totalPaymentsSent,
        netBalance: running,
      },
    };
  }

  // Calculate high-level summary for the dashboard
  async getDashboardMetrics(userId: string) {
    const [customers, incomes, expenses, payments] = await Promise.all([
      this.getCustomers(userId),
      this.getIncomes(userId),
      this.getExpenses(userId),
      this.getLedgerTransactions(userId),
    ]);

    let totalReceivable = 0; // Lene (Customers who owe us)
    let totalPayable = 0; // Dene (Customers to whom we owe advance/credit)

    for (const cust of customers) {
      const { summary } = await this.getCustomerLedgerTimeline(userId, cust.id);
      if (summary.netBalance > 0) {
        totalReceivable += summary.netBalance;
      } else if (summary.netBalance < 0) {
        totalPayable += Math.abs(summary.netBalance);
      }
    }

    // Current Month Income & Expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = incomes
      .filter((i) => {
        const d = new Date(i.income_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const monthlyExpenses = expenses
      .filter((e) => {
        const d = new Date(e.expense_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      totalReceivable,
      totalPayable,
      netBalance: totalReceivable - totalPayable,
      monthlyIncome,
      monthlyExpenses,
      cashFlowProfit: monthlyIncome - monthlyExpenses,
      totalCustomers: customers.length,
      totalTransactions: incomes.length + expenses.length + payments.length,
    };
  }

  // ==================== REMINDER MESSAGES (WHATSAPP & SMS) ====================
  getReminderMessage(params: {
    customerName: string;
    currency: string;
    netBalance: number;
    shopName: string;
    shopPhone?: string;
    language?: "en" | "ur" | "ur-Roman";
  }): string {
    const lang = params.language || "ur-Roman";
    const amount = Math.abs(params.netBalance).toLocaleString();
    const isReceivable = params.netBalance >= 0;

    if (lang === "ur") {
      return isReceivable
        ? `السلام علیکم ${params.customerName}،\nآپ کے ذمہ ${params.currency} ${amount} بقایا ہیں۔ برائے مہربانی جلد ادا کریں۔ شکریہ!\n-${params.shopName}`
        : `السلام علیکم ${params.customerName}،\nآپ کی طرف سے ${params.currency} ${amount} ایڈوانس وصول ہوچکے ہیں۔ شکریہ!\n-${params.shopName}`;
    }

    if (lang === "ur-Roman") {
      return isReceivable
        ? `Assalam-o-Alaikum ${params.customerName},\n\nAap ke zimme *${params.shopName}* ka ${params.currency} ${amount} baqaya hai. Baraye meherbani jald ada karein.\n\nShukriya!`
        : `Assalam-o-Alaikum ${params.customerName},\n\n*${params.shopName}* ko aap ki taraf se ${params.currency} ${amount} advance wasool ho chuka hai.\n\nShukriya!`;
    }

    return isReceivable
      ? `Dear ${params.customerName},\n\nThis is a friendly reminder from *${params.shopName}*. You have an outstanding balance of ${params.currency} ${amount}. Kindly clear your payment at your earliest convenience.\n\nThank you!`
      : `Dear ${params.customerName},\n\nThank you for your advance payment of ${params.currency} ${amount} to *${params.shopName}*.\n\nBest regards!`;
  }

  generateWhatsAppReminderUrl(params: {
    customerName: string;
    phone: string;
    currency: string;
    netBalance: number;
    shopName: string;
    shopPhone?: string;
    language?: "en" | "ur" | "ur-Roman";
    totalPurchases?: number;
    totalPayments?: number;
  }): string {
    let cleanPhone = params.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.slice(1);
    }
    const message = this.getReminderMessage(params);
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  generateSmsReminderUrl(params: {
    customerName: string;
    phone: string;
    currency: string;
    netBalance: number;
    shopName: string;
    shopPhone?: string;
    language?: "en" | "ur" | "ur-Roman";
  }): string {
    const cleanPhone = params.phone.replace(/[^0-9+]/g, "");
    const message = this.getReminderMessage(params);
    return `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;
  }

  // ==================== STATEMENT PDF GENERATOR ====================
  generateStatementPDF(params: {
    businessName: string;
    businessAddress: string;
    businessPhone: string;
    customer: Customer;
    timeline: LedgerRow[];
    summary: { totalPurchases: number; totalPaymentsReceived: number; totalPaymentsSent: number; netBalance: number };
    currency: string;
  }) {
    const doc = new jsPDF();

    // Primary Header Banner
    doc.setFillColor(26, 35, 126); // Brand Primary #1A237E
    doc.rect(0, 0, 210, 36, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(params.businessName || "HisabDo Enterprise", 14, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${params.businessAddress} | Tel: ${params.businessPhone}`, 14, 26);
    doc.text("CUSTOMER STATEMENT / KHATA LEDGER", 14, 32);

    // Customer Info Card Box
    doc.setTextColor(30, 41, 59);
    doc.setFillColor(248, 249, 253);
    doc.roundedRect(14, 42, 182, 28, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Statement For:", 20, 50);
    doc.setFont("helvetica", "normal");
    doc.text(`${params.customer.name} (${params.customer.phone})`, 50, 50);

    if (params.customer.address) {
      doc.setFont("helvetica", "bold");
      doc.text("Address:", 20, 56);
      doc.setFont("helvetica", "normal");
      doc.text(params.customer.address, 50, 56);
    }

    doc.setFont("helvetica", "bold");
    doc.text("Statement Date:", 20, 64);
    doc.setFont("helvetica", "normal");
    doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 50, 64);

    // Outstanding Balance highlight on top right
    const isReceivable = params.summary.netBalance >= 0;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isReceivable ? 26 : 229, isReceivable ? 35 : 57, isReceivable ? 126 : 53);
    doc.text(
      `Net Balance: ${params.currency} ${Math.abs(params.summary.netBalance).toLocaleString()}`,
      130,
      52
    );
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(isReceivable ? "(Receivable from Customer)" : "(Merchant Owes Customer)", 130, 58);

    // Table Data
    const tableBody = [...params.timeline].reverse().map((row) => {
      const debit = row.type === "Purchase" || row.type === "Payment Sent" ? `${params.currency} ${row.amount.toLocaleString()}` : "-";
      const credit = row.type === "Payment Received" || row.type === "Expense" ? `${params.currency} ${row.amount.toLocaleString()}` : "-";
      const running = `${params.currency} ${row.runningBalance.toLocaleString()}`;

      return [
        new Date(row.date).toLocaleDateString(),
        row.type,
        row.note,
        debit,
        credit,
        running,
      ];
    });

    autoTable(doc, {
      startY: 75,
      head: [["Date", "Entry Type", "Description / Notes", "Debit (+)", "Credit (-)", "Balance"]],
      body: tableBody,
      headStyles: {
        fillColor: [26, 35, 126],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 249, 253],
      },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 32 },
        2: { cellWidth: 50 },
        3: { cellWidth: 26, halign: "right" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
      },
    });

    // Summary Totals block at bottom
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(110, finalY, 86, 32, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`Total Purchases:`, 115, finalY + 8);
    doc.text(`${params.currency} ${params.summary.totalPurchases.toLocaleString()}`, 190, finalY + 8, { align: "right" });

    doc.text(`Total Payments Received:`, 115, finalY + 16);
    doc.text(`${params.currency} ${params.summary.totalPaymentsReceived.toLocaleString()}`, 190, finalY + 16, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 35, 126);
    doc.text(`Net Outstanding:`, 115, finalY + 25);
    doc.text(`${params.currency} ${params.summary.netBalance.toLocaleString()}`, 190, finalY + 25, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(148, 163, 184);
    doc.text("Generated securely via HisabDo Accounting Web App", 105, 285, { align: "center" });

    doc.save(`HisabDo_Statement_${params.customer.name.replace(/\s+/g, "_")}.pdf`);
  }
}

export const hisabDoService = new HisabDoService();
