"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Plus, Check } from "lucide-react";

export interface CategoryInputDropdownProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  categories: string[];
  onAddCategory: (newCategory: string) => Promise<boolean | void> | boolean | void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  variant?: "income" | "expense" | "default";
  className?: string;
}

export function CategoryInputDropdown({
  id,
  name = "category",
  value,
  onChange,
  categories,
  onAddCategory,
  error,
  placeholder = "Select or type category...",
  required = false,
  disabled = false,
  variant = "default",
  className = "",
}: CategoryInputDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync searchQuery when value prop changes externally (e.g. edit mode or reset)
  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  // Filter categories dynamically as user types (case-insensitive substring match)
  const trimmedQuery = searchQuery.trim();
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(trimmedQuery.toLowerCase())
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);

        // If the typed query exactly matches an existing category, select it
        const exactMatch = categories.find(
          (c) => c.trim().toLowerCase() === trimmedQuery.toLowerCase()
        );
        if (exactMatch) {
          setSearchQuery(exactMatch);
          onChange(exactMatch);
          setValidationError(null);
        } else if (!trimmedQuery) {
          // If cleared, notify parent
          onChange("");
        } else if (value) {
          // If user typed something random and clicked outside without adding, revert to current value
          setSearchQuery(value);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [categories, trimmedQuery, value, onChange]);

  // Select an existing category
  const handleSelectCategory = (cat: string) => {
    setSearchQuery(cat);
    onChange(cat);
    setIsOpen(false);
    setValidationError(null);
    setHighlightedIndex(-1);
  };

  // Add a new category
  const handleAddNewCategory = async () => {
    const trimmed = searchQuery.trim();

    // Rule 11 & 12: Trim and check for empty
    if (!trimmed) {
      setValidationError("Category name cannot be empty.");
      inputRef.current?.focus();
      return;
    }

    // Rule 9 & 10: Prevent duplicate categories, ignoring uppercase and lowercase differences
    const duplicate = categories.find(
      (c) => c.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      setValidationError(`Category "${trimmed}" already exists.`);
      inputRef.current?.focus();
      return;
    }

    try {
      setValidationError(null);
      await onAddCategory(trimmed);
      setSearchQuery(trimmed);
      onChange(trimmed);
      setIsOpen(false);
      setHighlightedIndex(-1);
    } catch (err: any) {
      setValidationError(err?.message || `Failed to add category "${trimmed}".`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setValidationError(null);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(-1);

    // If typed value exactly matches an existing category, update parent value
    const exact = categories.find((c) => c.toLowerCase() === val.trim().toLowerCase());
    if (exact) {
      onChange(exact);
    } else {
      onChange(val);
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setIsOpen(true);
      return;
    }

    if (isOpen) {
      const totalOptions = filteredCategories.length + 1; // categories + "Add new category" option

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % totalOptions);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? totalOptions - 1 : prev - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightedIndex === filteredCategories.length) {
          // Highlighted on "Add new category"
          handleAddNewCategory();
        } else if (highlightedIndex >= 0 && highlightedIndex < filteredCategories.length) {
          // Highlighted on an existing category
          handleSelectCategory(filteredCategories[highlightedIndex]);
        } else {
          // No explicit highlight: if there's an exact match in filtered, pick it, otherwise add new
          const exact = filteredCategories.find(
            (c) => c.toLowerCase() === trimmedQuery.toLowerCase()
          );
          if (exact) {
            handleSelectCategory(exact);
          } else {
            handleAddNewCategory();
          }
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
  };

  const displayError = validationError || error;

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Combined Text Input and Dropdown */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={`w-full px-3 py-2 pe-10 rounded-control text-sm border bg-surface text-foreground transition focus:outline-none focus:ring-1 ${
            variant === "income"
              ? "focus:ring-success focus:border-success"
              : variant === "expense"
              ? "focus:ring-danger focus:border-danger"
              : "focus:ring-primary focus:border-primary"
          } ${
            displayError
              ? "border-danger ring-1 ring-danger text-danger"
              : "border-border"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-surface-muted" : ""}`}
        />

        {/* Dropdown chevron toggle button */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (!isOpen) {
                inputRef.current?.focus();
              }
            }
          }}
          className="absolute inset-y-0 end-0 px-2.5 flex items-center text-muted-foreground hover:text-foreground transition disabled:opacity-50 focus-visible:outline-none"
          aria-label="Toggle categories dropdown"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-xs text-danger mt-1">{displayError}</p>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-56 overflow-y-auto rounded-control border border-border bg-surface shadow-lg py-1"
        >
          {/* Filtered existing categories */}
          {filteredCategories.map((cat, idx) => {
            const isSelected = cat.toLowerCase() === value.trim().toLowerCase();
            const isHighlighted = idx === highlightedIndex;

            return (
              <button
                key={cat}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelectCategory(cat)}
                className={`w-full px-3 py-2 text-sm text-start flex items-center justify-between transition ${
                  isHighlighted
                    ? "bg-surface-muted text-foreground"
                    : isSelected
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-foreground hover:bg-surface-muted"
                }`}
              >
                <span className="truncate">{cat}</span>
                {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ms-2" />}
              </button>
            );
          })}

          {/* Always display "Add new category" as the final dropdown option */}
          <button
            type="button"
            role="option"
            aria-selected={highlightedIndex === filteredCategories.length}
            onMouseEnter={() => setHighlightedIndex(filteredCategories.length)}
            onClick={handleAddNewCategory}
            className={`w-full px-3 py-2 text-sm text-start font-semibold text-primary flex items-center justify-between transition ${
              filteredCategories.length > 0 ? "border-t border-border" : ""
            } ${
              highlightedIndex === filteredCategories.length
                ? "bg-primary/10"
                : "hover:bg-surface-muted"
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              <Plus className="w-4 h-4 shrink-0" />
              <span className="truncate">
                Add new category{trimmedQuery ? `: "${trimmedQuery}"` : ""}
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
