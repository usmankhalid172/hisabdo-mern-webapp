/**
 * Date and category validation utility for Income and Expense forms.
 * Validates date formats (DD-MM-YYYY for display, YYYY-MM-DD for storage),
 * calendar validity (e.g., leap years, month length),
 * hard date limits (5 years past, 3 years future),
 * confirmation warnings (90 days past, 1 year future),
 * and category lists.
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

/**
 * Returns local today in YYYY-MM-DD format using date-only local values (no timezone shift).
 */
export function getTodayDateString(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, "0");
  const day = String(refDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Returns local today in DD-MM-YYYY format using date-only local values.
 */
export function getTodayDmyString(refDate: Date = new Date()): string {
  const year = refDate.getFullYear();
  const month = String(refDate.getMonth() + 1).padStart(2, "0");
  const day = String(refDate.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

/**
 * Converts DD-MM-YYYY to YYYY-MM-DD without any timezone shifts.
 */
export function dmyToYmd(dmy: string): string {
  if (!dmy || typeof dmy !== "string") return "";
  const parts = dmy.trim().split("-");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y || y.length !== 4) return "";
  return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/**
 * Converts YYYY-MM-DD to DD-MM-YYYY without any timezone shifts.
 */
export function ymdToDmy(ymd: string): string {
  if (!ymd || typeof ymd !== "string") return "";
  const parts = ymd.trim().split("-");
  if (parts.length !== 3) return "";
  const [y, m, d] = parts;
  if (!y || !m || !d || y.length !== 4) return "";
  return `${d.padStart(2, "0")}-${m.padStart(2, "0")}-${y.padStart(4, "0")}`;
}

/**
 * Checks if a given year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  if (isNaN(year)) return false;
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the exact number of days in a given month and year.
 * Handles leap years for February.
 */
export function getDaysInMonth(year: number, month: number): number {
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return 0;
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

/**
 * Validates calendar validity of day, month, and year.
 * Correctly rejects impossible dates like 31-04-2026, 30-02-2026, 29-02-2025.
 * Correctly accepts leap-year dates like 29-02-2024.
 */
export function isValidCalendarDate(day: number, month: number, year: number): boolean {
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (year < 1000 || year > 9999) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInMonth(year, month);
  return day >= 1 && day <= maxDays;
}

/**
 * Validates a DD-MM-YYYY date string for format and calendar validity.
 */
export function isValidDmyDateString(dmyStr: string): boolean {
  if (!dmyStr || typeof dmyStr !== "string") return false;
  const regex = /^\d{2}-\d{2}-\d{4}$/;
  if (!regex.test(dmyStr.trim())) return false;
  const [d, m, y] = dmyStr.trim().split("-").map(Number);
  return isValidCalendarDate(d, m, y);
}

/**
 * Validates a YYYY-MM-DD date string for format and calendar validity.
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== "string") return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr.trim())) return false;
  const [y, m, d] = dateStr.trim().split("-").map(Number);
  return isValidCalendarDate(d, m, y);
}

/**
 * Calculates date boundary strings relative to reference date (local today).
 * Date-only comparisons with zero timezone shifts.
 */
export function getDateLimits(refDate: Date = new Date()) {
  const y = refDate.getFullYear();
  const m = refDate.getMonth(); // 0-based
  const d = refDate.getDate();

  // Hard limits:
  // 5 years older:
  const minHard = new Date(y - 5, m, d);
  // Clamp day in case of Feb 29 leap shift
  if (minHard.getMonth() !== m) minHard.setDate(0);
  const minHardDate = getTodayDateString(minHard);

  // 3 years future:
  const maxHard = new Date(y + 3, m, d);
  if (maxHard.getMonth() !== m) maxHard.setDate(0);
  const maxHardDate = getTodayDateString(maxHard);

  // Confirmation warning limits:
  // More than 90 days in the past:
  const warnPast = new Date(y, m, d - 90);
  const warningPastDate = getTodayDateString(warnPast);

  // More than 1 year in the future:
  const warnFuture = new Date(y + 1, m, d);
  if (warnFuture.getMonth() !== m) warnFuture.setDate(0);
  const warningFutureDate = getTodayDateString(warnFuture);

  return {
    today: getTodayDateString(refDate),
    todayDmy: getTodayDmyString(refDate),
    minHardDate,
    maxHardDate,
    warningPastDate,
    warningFutureDate,
  };
}

export interface DateValidationResult {
  isValid: boolean;
  error?: string;
  isWarning?: boolean;
  warningMessage?: string;
}

/**
 * Evaluates date against hard limits (5 years past, 3 years future)
 * and confirmation warning limits (90 days past, 1 year future).
 * Takes date in YYYY-MM-DD format.
 */
export function validateDateRestrictions(
  ymdDate: string,
  refDate: Date = new Date()
): DateValidationResult {
  if (!ymdDate || !ymdDate.trim()) {
    return { isValid: false, error: "Date is required" };
  }

  const trimmed = ymdDate.trim();
  if (!isValidDateString(trimmed)) {
    return { isValid: false, error: "Please enter a valid calendar date" };
  }

  const { minHardDate, maxHardDate, warningPastDate, warningFutureDate } = getDateLimits(refDate);

  // Hard limit: older than 5 years
  if (trimmed < minHardDate) {
    return {
      isValid: false,
      error: `Date cannot be older than 5 years (min: ${ymdToDmy(minHardDate)})`,
    };
  }

  // Hard limit: more than 3 years in the future
  if (trimmed > maxHardDate) {
    return {
      isValid: false,
      error: `Date cannot be more than 3 years in the future (max: ${ymdToDmy(maxHardDate)})`,
    };
  }

  // Warning: more than 90 days in the past
  if (trimmed < warningPastDate) {
    return {
      isValid: true,
      isWarning: true,
      warningMessage: `The selected date (${ymdToDmy(trimmed)}) is more than 90 days in the past. Are you sure you want to proceed?`,
    };
  }

  // Warning: more than 1 year in the future
  if (trimmed > warningFutureDate) {
    return {
      isValid: true,
      isWarning: true,
      warningMessage: `The selected date (${ymdToDmy(trimmed)}) is more than 1 year in the future. Are you sure you want to proceed?`,
    };
  }

  return { isValid: true };
}

/**
 * Formats a raw user input string as DD-MM-YYYY with digits-only and automatic dashes.
 * Automatically inserts a '-' after the 2nd digit and 4th digit.
 */
export function formatDateInput(raw: string): string {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
}

/**
 * Parses and normalizes pasted date strings into DD-MM-YYYY format.
 * Supports:
 * - YYYY-MM-DD (e.g. 2026-11-16)
 * - DD/MM/YYYY or DD.MM.YYYY (e.g. 16/11/2026)
 * - 8 digits DDMMYYYY (e.g. 16112026)
 */
export function parsePastedDate(pasted: string): string {
  if (!pasted || typeof pasted !== "string") return "";
  const trimmed = pasted.trim();

  // Case 1: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return ymdToDmy(trimmed);
  }

  // Case 2: DD/MM/YYYY or DD.MM.YYYY
  if (/^\d{2}[\/\.]\d{2}[\/\.]\d{4}$/.test(trimmed)) {
    const parts = trimmed.split(/[\/\.]/);
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }

  // Case 3: DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // Case 4: Digits only
  return formatDateInput(trimmed);
}

export interface DateValidationOptions {
  minDate?: string;
  maxDate?: string;
  required?: boolean;
}

/**
 * Backward-compatible validation wrapper for transaction dates.
 */
export function validateTransactionDate(
  dateStr: string,
  options?: DateValidationOptions
): DateValidationResult {
  const isRequired = options?.required ?? true;

  if (!dateStr || !dateStr.trim()) {
    if (isRequired) {
      return { isValid: false, error: "Date is required" };
    }
    return { isValid: true };
  }

  // If passed as DD-MM-YYYY, convert to YYYY-MM-DD for check
  const ymd = /^\d{2}-\d{2}-\d{4}$/.test(dateStr.trim())
    ? dmyToYmd(dateStr.trim())
    : dateStr.trim();

  if (!isValidDateString(ymd)) {
    return { isValid: false, error: "Please enter a valid calendar date" };
  }

  if (options?.maxDate && ymd > options.maxDate) {
    return {
      isValid: false,
      error: `Date cannot be in the future (max: ${options.maxDate})`,
    };
  }

  if (options?.minDate && ymd < options.minDate) {
    return {
      isValid: false,
      error: `Date cannot be earlier than ${options.minDate}`,
    };
  }

  return validateDateRestrictions(ymd);
}
