'use client';

import React from 'react';
import { Search } from 'lucide-react';

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  children,
  actions,
  className = '',
}: FilterBarProps) {
  return (
    <div
      className={`flex w-full flex-col gap-3 rounded-card border border-border bg-surface p-3 shadow-card sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-control border border-border bg-surface-muted ps-9 pe-3 py-2 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export default FilterBar;