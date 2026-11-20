"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import {
  dmyToYmd,
  ymdToDmy,
  formatDateInput,
  parsePastedDate,
  isValidDmyDateString,
  isValidDateString,
  getTodayDateString,
  getTodayDmyString,
  getDateLimits,
  getDaysInMonth,
} from "@/lib/validations/formDateValidation";

export interface DatePickerPopoverProps {
  id?: string;
  name?: string;
  value: string; // YYYY-MM-DD
  onChange: (ymd: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  variant?: "income" | "expense" | "default";
  className?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePickerPopover({
  id,
  name = "date",
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  variant = "default",
  className = "",
}: DatePickerPopoverProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    return value ? ymdToDmy(value) : "";
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse current selected or initial date to navigate calendar
  const initialDate = value && isValidDateString(value) ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth()); // 0-based

  // Sync display value when incoming prop value changes
  useEffect(() => {
    if (value && isValidDateString(value)) {
      const dmy = ymdToDmy(value);
      setDisplayValue(dmy);
      const [y, m] = value.split("-").map(Number);
      setViewYear(y);
      setViewMonth(m - 1);
    } else if (!value) {
      setDisplayValue("");
    }
  }, [value]);

  // Click outside listener to close calendar popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const { minHardDate, maxHardDate, warningPastDate, warningFutureDate, today } = getDateLimits();

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Select day from calendar grid
  const handleSelectDay = (day: number) => {
    const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dmy = `${String(day).padStart(2, "0")}-${String(viewMonth + 1).padStart(2, "0")}-${viewYear}`;
    setDisplayValue(dmy);
    onChange(ymd);
    setIsOpen(false);
  };

  // Quick jump to today
  const handleSelectToday = () => {
    const todayYmd = getTodayDateString();
    const todayDmy = getTodayDmyString();
    setDisplayValue(todayDmy);
    onChange(todayYmd);
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setIsOpen(false);
  };

  // Keyboard navigation / input typing handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setDisplayValue(formatted);

    if (formatted.length === 10) {
      if (isValidDmyDateString(formatted)) {
        const ymd = dmyToYmd(formatted);
        onChange(ymd);
        const [y, m] = ymd.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
      } else {
        onChange(dmyToYmd(formatted));
      }
    } else if (formatted.length === 0) {
      onChange("");
    }
  };

  // Backspace handling around dashes
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const target = e.currentTarget;
      const { selectionStart, selectionEnd, value: currentVal } = target;
      if (selectionStart === selectionEnd && selectionStart !== null) {
        // If cursor is right after a dash, delete dash and preceding digit
        if (selectionStart > 0 && currentVal[selectionStart - 1] === "-") {
          e.preventDefault();
          const before = currentVal.slice(0, selectionStart - 2);
          const after = currentVal.slice(selectionStart);
          const nextVal = formatDateInput(before + after);
          setDisplayValue(nextVal);
          if (nextVal.length === 10 && isValidDmyDateString(nextVal)) {
            onChange(dmyToYmd(nextVal));
          } else {
            onChange(dmyToYmd(nextVal));
          }
        }
      }
    }
  };

  // Paste handler supporting DD-MM-YYYY, YYYY-MM-DD, DD/MM/YYYY, digits
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const parsed = parsePastedDate(pasted);
    if (parsed) {
      setDisplayValue(parsed);
      if (parsed.length === 10 && isValidDmyDateString(parsed)) {
        const ymd = dmyToYmd(parsed);
        onChange(ymd);
        const [y, m] = ymd.split("-").map(Number);
        setViewYear(y);
        setViewMonth(m - 1);
      } else {
        onChange(dmyToYmd(parsed));
      }
    }
  };

  // Calendar grid calculations
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday
  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth + 1);

  // Variant accent styling for selected day
  const getSelectedBadgeClass = () => {
    if (variant === "income") return "bg-success text-white font-bold";
    if (variant === "expense") return "bg-danger text-white font-bold";
    return "bg-primary text-white font-bold";
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Date text input with automatic dashes and digits-only */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          maxLength={10}
          required={required}
          disabled={disabled}
          placeholder="DD-MM-YYYY"
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className={`w-full px-3 py-2 pr-10 text-sm rounded-control border bg-surface text-foreground transition focus:outline-none focus:ring-1 ${
            variant === "income"
              ? "focus:ring-success focus:border-success"
              : variant === "expense"
              ? "focus:ring-danger focus:border-danger"
              : "focus:ring-primary focus:border-primary"
          } ${
            error
              ? "border-danger ring-1 ring-danger text-danger"
              : "border-border"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-surface-muted" : ""}`}
        />

        {/* Themed calendar trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 p-1.5 rounded-control text-muted-foreground hover:text-foreground hover:bg-surface-muted transition"
          title="Open themed calendar"
          aria-label="Open themed calendar"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Themed Calendar Popover */}
      {isOpen && !disabled && (
        <div
          role="dialog"
          aria-label="Calendar date picker"
          className="absolute left-0 top-full mt-1.5 z-50 w-72 p-3 bg-surface text-foreground border border-border rounded-card shadow-dialog select-none transition-all"
        >
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-control text-muted-foreground hover:text-foreground hover:bg-surface-muted transition"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-foreground">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-control text-muted-foreground hover:text-foreground hover:bg-surface-muted transition"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((w) => (
              <span key={w} className="text-xs font-semibold text-muted-foreground py-1">
                {w}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank leading cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-8" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const day = idx + 1;
              const dateYmd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === dateYmd;
              const isToday = today === dateYmd;
              const isPastHard = dateYmd < minHardDate;
              const isFutureHard = dateYmd > maxHardDate;
              const isHardDisabled = isPastHard || isFutureHard;
              const isWarningPast = dateYmd < warningPastDate && !isPastHard;
              const isWarningFuture = dateYmd > warningFutureDate && !isFutureHard;
              const isWarning = isWarningPast || isWarningFuture;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isHardDisabled}
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-control transition ${
                    isSelected
                      ? getSelectedBadgeClass()
                      : isHardDisabled
                      ? "text-muted-foreground/30 opacity-30 cursor-not-allowed"
                      : isWarning
                      ? "text-warning hover:bg-surface-muted font-medium"
                      : isToday
                      ? "border border-primary font-bold text-foreground hover:bg-surface-muted"
                      : "text-foreground hover:bg-surface-muted"
                  }`}
                  title={
                    isHardDisabled
                      ? "Date outside permitted limits"
                      : isWarning
                      ? "Date requires confirmation"
                      : dateYmd
                  }
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer: Quick Today action */}
          <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-xs font-semibold text-primary hover:underline px-1 py-0.5 rounded-control"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded-control hover:bg-surface-muted transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatePickerPopover;
