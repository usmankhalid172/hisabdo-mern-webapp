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
  type: "received" | "paid" | "GOT_PAYMENT" | "GAVE_CREDIT" | "PAID_PAYMENT" | "PURCHASE_BILL" | string; // supports mobile, web, and khata ledger types
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


export const DEMO_USER_UUID = "54fed992-4a4f-4669-9c52-161ae531dfe0";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(val?: string | null): boolean {
  return typeof val === "string" && UUID_REGEX.test(val);
}

export function resolveUserId(userId: string): string {
  if (!userId || userId === "guest" || userId === "guest-user") {
    return "guest";
  }
  if (userId === "demo-user-1") {
    return DEMO_USER_UUID;
  }
  return userId;
}

export class HisabDoService {
  private getStorageKey(userId: string, key: string) {
    return `hisabdo_${userId || "guest"}_${key}`;
  }

  private isLocalOnly(userId: string): boolean {
    if (!userId) return true;
    const effective = resolveUserId(userId);
    if (effective === "guest" || effective === "guest-user") return true;
    if (effective === DEMO_USER_UUID) return false;
    return !isUuid(effective);
  }

  private async getAuthenticatedSupabaseClient(userId: string) {
    if (typeof window === "undefined") return null;
    const effectiveUserId = resolveUserId(userId);
    if (this.isLocalOnly(effectiveUserId)) {
      return null;
    }
    try {
      const supabase = createClient();
      let {
        data: { session },
      } = await supabase.auth.getSession();

      if (session && session.user && (session.user.id === effectiveUserId || effectiveUserId === DEMO_USER_UUID)) {
        return supabase;
      }
    } catch (err) {
      console.warn("Supabase auth session check failed:", err);
    }
    return null;
  }

  private async getAuthenticatedClient(userId: string) {
    return this.getAuthenticatedSupabaseClient(userId);
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
    const effectiveUserId = resolveUserId(userId);
    const fallback = this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (!supabase) return fallback;

    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase getCustomers warning:", error.message);
        return fallback;
      }

      const customers = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        phone: row.phone || "",
        email: row.email || "",
        address: row.address || "",
        opening_balance: Number(row.opening_balance ?? row.metadata?.opening_balance ?? row.metadata?.initialBalance ?? 0),
        currency: row.currency ?? row.metadata?.currency ?? "PKR",
        notes: row.notes || "",
        created_at: row.created_at,
      })) as Customer[];

      this.setLocal(userId, "customers", customers);
      this.setLocal(effectiveUserId, "customers", customers);
      return customers;
    } catch {
      return fallback;
    }
  }

  async addCustomer(userId: string, customer: Omit<Customer, "id" | "created_at">): Promise<Customer> {
    const effectiveUserId = resolveUserId(userId);

    const clientUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "c-" + Date.now();

    const dbPayload = {
      client_uuid: clientUuid,
      user_id: effectiveUserId,
      name: customer.name,
      phone: customer.phone || null,
      email: customer.email || null,
      notes: customer.notes || customer.address || null,
      metadata: {
        address: customer.address || null,
        opening_balance: Number(customer.opening_balance || 0),
        initialBalance: Number(customer.opening_balance || 0),
        netBalance: Number(customer.opening_balance || 0),
        currency: customer.currency || "PKR",
      },
    };

    const newCust: Customer = {
      ...customer,
      id: "cust-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("customers")
          .insert([{
            client_uuid: isUuid(clientUuid) ? clientUuid : undefined,
            user_id: effectiveUserId,
            name: customer.name,
            phone: customer.phone ? String(customer.phone).trim() : null,
            email: customer.email ? String(customer.email).trim() : null,
            address: customer.address ? String(customer.address).trim() : null,
            opening_balance: Number(customer.opening_balance || 0),
            currency: customer.currency || "PKR",
            notes: customer.notes || null,
          }])
          .select()
          .single();

        if (!error && data) {
          newCust.id = data.id;
          newCust.created_at = data.created_at;
        } else if (error) {
          console.warn("Supabase addCustomer warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase addCustomer network error:", err);
      }
    }

    const list = this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
    const updated = [newCust, ...list.filter((c) => c.id !== newCust.id)];
    this.setLocal(userId, "customers", updated);
    this.setLocal(effectiveUserId, "customers", updated);
    return newCust;
  }

  async updateCustomer(userId: string, id: string, updates: Partial<Customer>): Promise<Customer> {
    const list = this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
    let updatedCust: Customer | null = null;
    const updatedList = list.map((c) => {
      if (c.id === id) {
        updatedCust = { ...c, ...updates };
        return updatedCust;
      }
      return c;
    });

    if (!updatedCust) {
      throw new Error("Customer not found");
    }

    this.setLocal(userId, "customers", updatedList);

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.opening_balance !== undefined) dbUpdates.opening_balance = Number(updates.opening_balance);
        if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        dbUpdates.updated_at = new Date().toISOString();

        await supabase.from("customers").update(dbUpdates).eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase updateCustomer warning:", err);
      }
    }

    return updatedCust;
  }

  async deleteCustomer(userId: string, id: string): Promise<void> {
    const list = this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
    this.setLocal(userId, "customers", list.filter((c) => c.id !== id));

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        await supabase.from("customers").delete().eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase deleteCustomer warning:", err);
      }
    }
  }

  // ==================== INCOMES ====================
  async getIncomes(userId: string): Promise<Income[]> {
    const effectiveUserId = resolveUserId(userId);
    const fallback = this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (!supabase) return fallback;

    try {
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("income_date", { ascending: false });

      if (error) {
        console.warn("Supabase getIncomes warning:", error.message);
        return fallback;
      }

      const incomes = (data ?? []).map((row: any) => ({
        id: row.id,
        amount: Number(row.amount),
        customer_id: row.customer_id || undefined,
        category_id: row.category_id || row.metadata?.category || "Sales",
        income_date: row.income_date || row.date || new Date().toISOString().split("T")[0],
        description: row.description || row.note || "",
        payment_method: row.payment_method || row.metadata?.payment_method || "cash",
        created_at: row.created_at,
      })) as Income[];

      this.setLocal(userId, "incomes", incomes);
      this.setLocal(effectiveUserId, "incomes", incomes);
      return incomes;
    } catch {
      return fallback;
    }
  }

  async addIncome(userId: string, income: Omit<Income, "id" | "created_at">): Promise<Income> {
    const effectiveUserId = resolveUserId(userId);
    const dateStr = income.income_date ? income.income_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const clientUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "inc-" + Date.now();

    const dbPayload = {
      client_uuid: clientUuid,
      user_id: effectiveUserId,
      amount: Number(income.amount),
      date: dateStr,
      note: income.description || "",
      customer_id: income.customer_id || null,
      metadata: {
        category: income.category_id || "Sales",
        legacy_category: income.category_id || "Sales",
        payment_method: income.payment_method || "cash",
      },
    };

    const newInc: Income = {
      ...income,
      id: "inc-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase) {
      try {
        const validMethods = ["cash", "bank_transfer", "credit", "cheque", "other"];
        const method = (income.payment_method || "cash").toLowerCase();
        const payment_method = validMethods.includes(method) ? method : "cash";

        const { data, error } = await supabase
          .from("income")
          .insert([{
            client_uuid: isUuid(clientUuid) ? clientUuid : undefined,
            user_id: effectiveUserId,
            customer_id: isUuid(income.customer_id) ? income.customer_id : null,
            category_id: isUuid(income.category_id) ? income.category_id : null,
            amount: Number(income.amount),
            base_amount: Number(income.amount),
            currency: "PKR",
            base_currency: "PKR",
            exchange_rate: 1,
            income_date: dateStr,
            description: income.description || "",
            payment_method,
          }])
          .select()
          .single();

        if (!error && data) {
          newInc.id = data.id;
          newInc.created_at = data.created_at;
        } else if (error) {
          console.warn("Supabase addIncome warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase addIncome network error:", err);
      }
    }

    const list = this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
    const updated = [newInc, ...list.filter((i) => i.id !== newInc.id)];
    this.setLocal(userId, "incomes", updated);
    this.setLocal(effectiveUserId, "incomes", updated);
    return newInc;
  }

  async deleteIncome(userId: string, id: string): Promise<void> {
    const list = this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
    this.setLocal(userId, "incomes", list.filter((i) => i.id !== id));

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        await supabase.from("income").delete().eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase deleteIncome warning:", err);
      }
    }
  }

  async updateIncome(userId: string, id: string, updates: Partial<Income>): Promise<Income> {
    const list = this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
    let updatedItem: Income | null = null;
    const updatedList = list.map((i) => {
      if (i.id === id) {
        updatedItem = { ...i, ...updates };
        return updatedItem;
      }
      return i;
    });

    if (!updatedItem) {
      throw new Error("Income record not found");
    }

    this.setLocal(userId, "incomes", updatedList);

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.amount !== undefined) {
          dbUpdates.amount = Number(updates.amount);
          dbUpdates.base_amount = Number(updates.amount);
        }
        if (updates.customer_id !== undefined) {
          dbUpdates.customer_id = isUuid(updates.customer_id) ? updates.customer_id : null;
        }
        if (updates.category_id !== undefined) {
          dbUpdates.category_id = isUuid(updates.category_id) ? updates.category_id : null;
        }
        if (updates.income_date !== undefined) {
          dbUpdates.income_date = updates.income_date.split("T")[0];
        }
        if (updates.description !== undefined) {
          dbUpdates.description = updates.description;
        }
        if (updates.payment_method !== undefined) {
          const validMethods = ["cash", "bank_transfer", "credit", "cheque", "other"];
          const method = updates.payment_method.toLowerCase();
          dbUpdates.payment_method = validMethods.includes(method) ? method : "cash";
        }
        dbUpdates.updated_at = new Date().toISOString();

        await supabase.from("income").update(dbUpdates).eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase updateIncome warning:", err);
      }
    }

    return updatedItem;
  }

  // ==================== EXPENSES ====================
  async getExpenses(userId: string): Promise<Expense[]> {
    const effectiveUserId = resolveUserId(userId);
    const fallback = this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (!supabase) return fallback;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", effectiveUserId)
        .order("expense_date", { ascending: false });

      if (error) {
        console.warn("Supabase getExpenses warning:", error.message);
        return fallback;
      }

      const expenses = (data ?? []).map((row: any) => ({
        id: row.id,
        amount: Number(row.amount),
        customer_id: row.customer_id || undefined,
        category_id: row.category_id || row.metadata?.category || "General",
        expense_date: row.expense_date || row.date || new Date().toISOString().split("T")[0],
        description: row.description || row.note || "",
        payment_method: row.payment_method || row.metadata?.payment_method || "cash",
        created_at: row.created_at,
      })) as Expense[];

      this.setLocal(userId, "expenses", expenses);
      this.setLocal(effectiveUserId, "expenses", expenses);
      return expenses;
    } catch {
      return fallback;
    }
  }

  async addExpense(userId: string, expense: Omit<Expense, "id" | "created_at">): Promise<Expense> {
    const effectiveUserId = resolveUserId(userId);
    const dateStr = expense.expense_date ? expense.expense_date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const clientUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "exp-" + Date.now();

    const dbPayload = {
      client_uuid: clientUuid,
      user_id: effectiveUserId,
      amount: Number(expense.amount),
      date: dateStr,
      note: expense.description || "",
      customer_id: expense.customer_id || null,
      metadata: {
        category: expense.category_id || "General",
        legacy_category: expense.category_id || "General",
        payment_method: expense.payment_method || "cash",
      },
    };

    const newExp: Expense = {
      ...expense,
      id: "exp-" + Date.now(),
      created_at: new Date().toISOString(),
    };

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase) {
      try {
        const validMethods = ["cash", "bank_transfer", "credit", "cheque", "other"];
        const method = (expense.payment_method || "cash").toLowerCase();
        const payment_method = validMethods.includes(method) ? method : "cash";

        const { data, error } = await supabase
          .from("expenses")
          .insert([{
            client_uuid: isUuid(clientUuid) ? clientUuid : undefined,
            user_id: effectiveUserId,
            category_id: isUuid(expense.category_id) ? expense.category_id : null,
            amount: Number(expense.amount),
            base_amount: Number(expense.amount),
            currency: "PKR",
            base_currency: "PKR",
            exchange_rate: 1,
            expense_date: dateStr,
            description: expense.description || "",
            payment_method,
          }])
          .select()
          .single();

        if (!error && data) {
          newExp.id = data.id;
          newExp.created_at = data.created_at;
        } else if (error) {
          console.warn("Supabase addExpense warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase addExpense network error:", err);
      }
    }

    const list = this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
    const updated = [newExp, ...list.filter((e) => e.id !== newExp.id)];
    this.setLocal(userId, "expenses", updated);
    this.setLocal(effectiveUserId, "expenses", updated);
    return newExp;
  }

  async deleteExpense(userId: string, id: string): Promise<void> {
    const list = this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
    this.setLocal(userId, "expenses", list.filter((e) => e.id !== id));

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        await supabase.from("expenses").delete().eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase deleteExpense warning:", err);
      }
    }
  }

  async updateExpense(userId: string, id: string, updates: Partial<Expense>): Promise<Expense> {
    const list = this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
    let updatedItem: Expense | null = null;
    const updatedList = list.map((e) => {
      if (e.id === id) {
        updatedItem = { ...e, ...updates };
        return updatedItem;
      }
      return e;
    });

    if (!updatedItem) {
      throw new Error("Expense record not found");
    }

    this.setLocal(userId, "expenses", updatedList);

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.amount !== undefined) {
          dbUpdates.amount = Number(updates.amount);
          dbUpdates.base_amount = Number(updates.amount);
        }
        if (updates.category_id !== undefined) {
          dbUpdates.category_id = isUuid(updates.category_id) ? updates.category_id : null;
        }
        if (updates.expense_date !== undefined) {
          dbUpdates.expense_date = updates.expense_date.split("T")[0];
        }
        if (updates.description !== undefined) {
          dbUpdates.description = updates.description;
        }
        if (updates.payment_method !== undefined) {
          const validMethods = ["cash", "bank_transfer", "credit", "cheque", "other"];
          const method = updates.payment_method.toLowerCase();
          dbUpdates.payment_method = validMethods.includes(method) ? method : "cash";
        }
        dbUpdates.updated_at = new Date().toISOString();

        await supabase.from("expenses").update(dbUpdates).eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase updateExpense warning:", err);
      }
    }

    return updatedItem;
  }

  // ==================== DIRECT LEDGER PAYMENTS ====================
  async getLedgerTransactions(userId: string): Promise<LedgerTransaction[]> {
    const effectiveUserId = resolveUserId(userId);
    const fallback = this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (!supabase) return fallback;

    try {
      const { data, error } = await supabase
        .from("ledger_transactions")
        .select("*")
        .eq("user_id", effectiveUserId)
        .is("deleted_at", null)
        .order("date", { ascending: false });

      if (error) {
        console.warn("Supabase getLedgerTransactions warning:", error.message);
        return fallback;
      }

      const transactions = (data ?? []).map((row: any) => ({
        id: row.id,
        customerId: row.customer_id,
        amount: Number(row.amount),
        type: row.type,
        category: row.category ?? row.metadata?.category ?? "Payment",
        date: row.date,
        note: row.note ?? row.metadata?.description ?? "",
        imagePath: row.image_path ?? undefined,
      })) as LedgerTransaction[];

      this.setLocal(userId, "ledger_txs", transactions);
      this.setLocal(effectiveUserId, "ledger_txs", transactions);
      return transactions;
    } catch {
      return fallback;
    }
  }

  async addLedgerTransaction(userId: string, tx: Omit<LedgerTransaction, "id">): Promise<LedgerTransaction> {
    const effectiveUserId = resolveUserId(userId);

    const dateStr = tx.date ? tx.date.slice(0, 10) : new Date().toISOString().slice(0, 10);
    const clientUuid =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : "l-" + Date.now();

    const dbPayload = {
      client_uuid: clientUuid,
      user_id: effectiveUserId,
      customer_id: tx.customerId,
      amount: Number(tx.amount),
      type: tx.type,
      category: tx.category || "Payment",
      date: dateStr,
      note: tx.note || "",
      metadata: {
        customerId: tx.customerId,
        category: tx.category,
      },
    };

    const newTx: LedgerTransaction = {
      ...tx,
      id: "ltx-" + Date.now(),
      date: dateStr,
    };

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase) {
      try {
        const clientUuid =
          typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : "00000000-0000-4000-8000-" + Date.now().toString(16).padStart(12, "0");

        const { data, error } = await supabase
          .from("ledger_transactions")
          .insert([{
            client_uuid: isUuid(clientUuid) ? clientUuid : undefined,
            user_id: effectiveUserId,
            customer_id: isUuid(tx.customerId) ? tx.customerId : null,
            amount: Number(tx.amount),
            type: tx.type,
            category: tx.category || "Payment",
            date: dateStr,
            note: tx.note || null,
            image_path: tx.imagePath || null,
          }])
          .select()
          .single();

        if (!error && data) {
          newTx.id = data.id;
        } else if (error) {
          console.warn("Supabase addLedgerTransaction warning:", error.message);
        }
      } catch (err) {
        console.warn("Supabase addLedgerTransaction network error:", err);
      }
    }

    const list = this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
    const updated = [newTx, ...list.filter((t) => t.id !== newTx.id)];
    this.setLocal(userId, "ledger_txs", updated);
    this.setLocal(effectiveUserId, "ledger_txs", updated);
    return newTx;
  }

  async deleteLedgerTransaction(userId: string, id: string): Promise<void> {
    const list = this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
    this.setLocal(userId, "ledger_txs", list.filter((t) => t.id !== id));

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        await supabase
          .from("ledger_transactions")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", id)
          .eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase deleteLedgerTransaction warning:", err);
      }
    }
  }

  async updateLedgerTransaction(userId: string, id: string, updates: Partial<LedgerTransaction>): Promise<LedgerTransaction> {
    const list = this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
    let updatedItem: LedgerTransaction | null = null;
    const updatedList = list.map((t) => {
      if (t.id === id) {
        updatedItem = { ...t, ...updates };
        return updatedItem;
      }
      return t;
    });

    if (!updatedItem) {
      throw new Error("Ledger transaction record not found");
    }

    this.setLocal(userId, "ledger_txs", updatedList);

    const supabase = await this.getAuthenticatedSupabaseClient(userId);
    if (supabase && isUuid(id)) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.amount !== undefined) dbUpdates.amount = Number(updates.amount);
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.date !== undefined) dbUpdates.date = updates.date.split("T")[0];
        if (updates.note !== undefined) dbUpdates.note = updates.note;
        if (updates.imagePath !== undefined) dbUpdates.image_path = updates.imagePath;
        dbUpdates.updated_at = new Date().toISOString();

        await supabase.from("ledger_transactions").update(dbUpdates).eq("id", id).eq("user_id", userId);
      } catch (err) {
        console.warn("Supabase updateLedgerTransaction warning:", err);
      }
    }

    return updatedItem;
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
        const isReceived = p.type === "received" || p.type === "GOT_PAYMENT" || p.type === "PAID_PAYMENT";
        const isCredit = p.type === "GAVE_CREDIT" || p.type === "PURCHASE_BILL";
        if (isCredit) {
          tempRows.push({
            id: p.id,
            date: p.date,
            type: "Purchase",
            rawType: "income",
            amount: Number(p.amount),
            note: p.note || "Credit Given (Udhar)",
            category: p.category || "Credit",
            sourceTable: "ledger_transactions",
          });
        } else {
          tempRows.push({
            id: p.id,
            date: p.date,
            type: isReceived ? "Payment Received" : "Payment Sent",
            rawType: isReceived ? "received" : "paid",
            amount: Number(p.amount),
            note: p.note || (isReceived ? "Payment Received (Jama)" : "Payment Sent (Naam)"),
            category: p.category || "Payment",
            sourceTable: "ledger_transactions",
          });
        }
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

  // Helper to compute metrics synchronously from in-memory arrays (0ms CPU time)
  computeMetricsSync(
    customers: Customer[],
    incomes: Income[],
    expenses: Expense[],
    payments: LedgerTransaction[]
  ) {
    let totalReceivable = 0; // Lene (Customers who owe us)
    let totalPayable = 0; // Dene (Customers to whom we owe advance/credit)

    for (const cust of customers) {
      let running = Number(cust.opening_balance || 0);

      for (const i of incomes) {
        if (i.customer_id === cust.id) {
          running += Number(i.amount || 0);
        }
      }
      for (const e of expenses) {
        if (e.customer_id === cust.id) {
          running -= Number(e.amount || 0);
        }
      }
      for (const p of payments) {
        if (p.customerId === cust.id) {
          const isReceived = p.type === "received" || p.type === "GOT_PAYMENT" || p.type === "PAID_PAYMENT";
          const isCredit = p.type === "GAVE_CREDIT" || p.type === "PURCHASE_BILL";
          if (isCredit) {
            running += Number(p.amount || 0);
          } else if (isReceived) {
            running -= Number(p.amount || 0);
          } else {
            running += Number(p.amount || 0);
          }
        }
      }

      if (running > 0) {
        totalReceivable += running;
      } else if (running < 0) {
        totalPayable += Math.abs(running);
      }
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyIncome = incomes
      .filter((i) => {
        const d = new Date(i.income_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);

    const monthlyExpenses = expenses
      .filter((e) => {
        const d = new Date(e.expense_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

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

  // Calculate high-level summary for the dashboard
  async getDashboardMetrics(
    userId: string,
    preloadedData?: {
      customers: Customer[];
      incomes: Income[];
      expenses: Expense[];
      payments: LedgerTransaction[];
    }
  ) {
    const customers = preloadedData?.customers ?? (await this.getCustomers(userId));
    const incomes = preloadedData?.incomes ?? (await this.getIncomes(userId));
    const expenses = preloadedData?.expenses ?? (await this.getExpenses(userId));
    const payments = preloadedData?.payments ?? (await this.getLedgerTransactions(userId));

    return this.computeMetricsSync(customers, incomes, expenses, payments);
  }

  getCachedCustomers(userId: string): Customer[] {
    return this.getLocal<Customer[]>(userId, "customers", DEFAULT_CUSTOMERS);
  }

  getCachedIncomes(userId: string): Income[] {
    return this.getLocal<Income[]>(userId, "incomes", DEFAULT_INCOMES);
  }

  getCachedExpenses(userId: string): Expense[] {
    return this.getLocal<Expense[]>(userId, "expenses", DEFAULT_EXPENSES);
  }

  getCachedLedgerTransactions(userId: string): LedgerTransaction[] {
    return this.getLocal<LedgerTransaction[]>(userId, "ledger_txs", DEFAULT_LEDGER_TXS);
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
