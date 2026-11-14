"use client";

import React from "react";
import { Edit2, Trash2 } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { type LedgerRow } from "@/services/hisabdoService";

interface LedgerTableProps {
  rows: LedgerRow[];
  formatMoney: (amount: number) => string;
  onEdit: (row: LedgerRow) => void;
  onDelete: (row: LedgerRow) => void;
}

export function CustomerLedgerTable({
  rows,
  formatMoney,
  onEdit,
  onDelete,
}: LedgerTableProps) {
  const isIncomeRow = (row: LedgerRow) =>
    row.type === "Purchase" ||
    row.type === "Payment Sent" ||
    row.rawType === "income" ||
    row.rawType === "paid";

  const columns: DataTableColumn<LedgerRow>[] = [
    {
      key: "date",
      header: "Date",
      sortable: true,
      render: (row) =>
        new Date(row.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    {
      key: "category",
      header: "Category / Note",
      sortable: true,
      render: (row) => (
        <div className="min-w-0">
          <p className="font-bold text-sm text-foreground truncate">
            {row.category}
          </p>
          {row.note && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {row.note}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      align: "center",
      render: (row) => (
        <Badge variant={isIncomeRow(row) ? "success" : "danger"}>
          {isIncomeRow(row) ? "Income" : "Expense"}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      align: "right",
      render: (row) => (
        <span
          className={`font-black ${
            isIncomeRow(row) ? "text-success" : "text-danger"
          }`}
        >
          {isIncomeRow(row) ? "+" : "-"}
          {formatMoney(row.amount)}
        </span>
      ),
    },
    {
      key: "runningBalance",
      header: "Balance",
      align: "right",
      render: (row) => (
        <span className="text-xs text-muted-foreground">
          {formatMoney(row.runningBalance)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(row)}
            title="Edit entry"
            className="p-1.5 rounded-control text-muted-foreground hover:text-info hover:bg-info/10 transition"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            title="Delete entry"
            className="p-1.5 rounded-control text-muted-foreground hover:text-danger hover:bg-danger/10 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      rowKey={(row) => row.id}
      emptyTitle="No ledger entries"
      emptyMessage="Is customer ke liye abhi koi entry nahi hai."
    />
  );
}