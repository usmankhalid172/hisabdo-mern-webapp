/**
 * Date and category validation utility for Income and Expense forms.
 * Validates date format (YYYY-MM-DD), calendar validity (e.g., leap years, month length),
 * sensible past/future range limits, and category lists.
 */

export const DEFAULT_INCOME_CATEGORIES = [
  "Sales",
  "Salary",
  "Gift",
  "Service Fee",
  "Commission",
  "Other",
];

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

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  // Match standard YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [y, m, d] = dateStr.split("-").map(Number);
  if (isNaN(y) || isNaN(m) || isNaN(d)) return false;
  if (m < 1 || m > 12) return false;

  // Check valid day of that specific month (handles 28, 29, 30, 31 days)
  const maxDays = new Date(y, m, 0).getDate();
  if (d < 1 || d > maxDays) return false;

  return true;
}

export interface DateValidationOptions {
  minDate?: string; // Default: '2000-01-01'
  maxDate?: string; // Default: today
  required?: boolean;
}

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateTransactionDate(
  dateStr: string,
  options?: DateValidationOptions
): DateValidationResult {
  const isRequired = options?.required ?? true;
  const maxDate = options?.maxDate ?? getTodayDateString();
  const minDate = options?.minDate ?? "2000-01-01";

  if (!dateStr || !dateStr.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Date is required" };
    }
    return { isValid: true };
  }

  const trimmed = dateStr.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return {
      isValid: false,
      error: "Date must be in YYYY-MM-DD format",
    };
  }

  if (!isValidDateString(trimmed)) {
    return {
      isValid: false,
      error: "Please enter a valid calendar date",
    };
  }

  if (maxDate && trimmed > maxDate) {
    return {
      isValid: false,
      error: `Date cannot be in the future (max: ${maxDate})`,
    };
  }

  if (minDate && trimmed < minDate) {
    return {
      isValid: false,
      error: `Date cannot be earlier than ${minDate}`,
    };
  }

  return { isValid: true };
}

