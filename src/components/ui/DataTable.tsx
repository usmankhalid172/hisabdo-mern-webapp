'use client';

import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, Inbox } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortChange?: (key: string, direction: SortDirection) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyTitle = 'No records',
  emptyMessage = 'Nothing to show here yet.',
  emptyAction,
  onRowClick,
  sortKey,
  sortDirection,
  onSortChange,
  className = '',
}: DataTableProps<T>) {
  const [internalSort, setInternalSort] = useState<{
    key: string;
    direction: SortDirection;
  }>({ key: sortKey ?? '', direction: sortDirection ?? null });

  const activeSortKey = sortKey ?? internalSort.key;
  const activeSortDirection = sortDirection ?? internalSort.direction;

  const handleSort = (column: DataTableColumn<T>) => {
    if (!column.sortable) return;

    let nextDirection: SortDirection;
    if (activeSortKey !== column.key) nextDirection = 'asc';
    else if (activeSortDirection === 'asc') nextDirection = 'desc';
    else if (activeSortDirection === 'desc') nextDirection = null;
    else nextDirection = 'asc';

    setInternalSort({
      key: nextDirection ? column.key : '',
      direction: nextDirection,
    });
    onSortChange?.(column.key, nextDirection);
  };

  const sortedData = useMemo(() => {
    if (!activeSortKey || !activeSortDirection) return data;
    const column = columns.find((c) => c.key === activeSortKey);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[column.key];
      const bv = (b as Record<string, unknown>)[column.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;

      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return activeSortDirection === 'asc' ? -1 : 1;
      if (as > bs) return activeSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, columns, activeSortKey, activeSortDirection]);

  const alignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-end';
    return 'text-start';
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="overflow-x-auto rounded-card border border-[var(--border-color)] bg-surface shadow-card">
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-color)] bg-surface-muted">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wide text-[var(--text-secondary)] ${alignClass(
                    col.align
                  )}`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col)}
                      className={`inline-flex items-center gap-1.5 rounded-control px-1 py-0.5 transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        activeSortKey === col.key ? 'text-primary' : ''
                      }`}
                      aria-sort={
                        activeSortKey === col.key && activeSortDirection
                          ? activeSortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <span>{col.header}</span>
                      {activeSortKey === col.key && activeSortDirection === 'asc' && (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {activeSortKey === col.key && activeSortDirection === 'desc' && (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {activeSortKey !== col.key && (
                        <ChevronsUpDown
                          className="h-3.5 w-3.5 opacity-40"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    <span>{col.header}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16">
                  <div className="flex flex-col items-center justify-center gap-3 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Inbox className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {emptyTitle}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {emptyMessage}
                      </p>
                    </div>
                    {emptyAction && <div className="mt-1">{emptyAction}</div>}
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-[var(--border-color)] last:border-0 transition-colors ${
                    onRowClick
                      ? 'cursor-pointer hover:bg-surface-muted focus-within:bg-surface-muted'
                      : 'hover:bg-surface-muted'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-[var(--text-primary)] ${alignClass(
                        col.align
                      )} ${col.className ?? ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;