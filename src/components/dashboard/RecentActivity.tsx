"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/design-system/Card";
import { EmptyState } from "@/components/ui/design-system/EmptyState";
import { ErrorState } from "@/components/ui/design-system/ErrorState";
import { LoadingState } from "@/components/ui/design-system/LoadingState";
import { Badge } from "@/components/ui/Badge";

export type RecentActivityTransaction = {
  id: string;
  type: "income" | "expense" | "payment_received" | "payment_sent";
  amount: number;
  date: string;
  description: string;
  customerName?: string;
};

type RecentActivityProps = {
  transactions: RecentActivityTransaction[];
  formatMoney: (amount: number) => string;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  limit?: number;
};

const transactionLabels: Record<RecentActivityTransaction["type"], string> = {
  income: "Income",
  expense: "Expense",
  payment_received: "Payment Received",
  payment_sent: "Payment Sent",
};

export function RecentActivity({
  transactions,
  formatMoney,
  isLoading = false,
  error = null,
  onRetry,
  limit = 5,
}: RecentActivityProps) {
  const safeLimit = Math.max(0, limit);
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, safeLimit);

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Recent Activity
        </h2>

        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState variant="skeleton" message="Loading recent activity..." />
      ) : error ? (
        <ErrorState
          title="Unable to load activity"
          message={error}
          onRetry={onRetry}
        />
      ) : recentTransactions.length === 0 ? (
        <EmptyState
          title="No recent activity"
          message="Your recent transactions will appear here."
        />
      ) : (
        <div className="divide-y divide-border">
          {recentTransactions.map((transaction) => {
            const isPositive =
              transaction.type === "income" ||
              transaction.type === "payment_received";

            const badgeVariant = isPositive ? "success" : "danger";
            const amountPrefix = isPositive ? "+" : "-";
            const date = new Date(transaction.date);
            const formattedDate = Number.isNaN(date.getTime())
              ? transaction.date
              : `${String(date.getUTCDate()).padStart(2, "0")}/${String(
                  date.getUTCMonth() + 1
                ).padStart(2, "0")}/${date.getUTCFullYear()}`;

            return (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isPositive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}
                    aria-hidden="true"
                  >
                    {isPositive ? (
                      <ArrowDownLeft size={18} />
                    ) : (
                      <ArrowUpRight size={18} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {transaction.description}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {transaction.customerName || "No customer"} - {formattedDate}
                    </p>
                    <Badge variant={badgeVariant} className="mt-1">
                      {transactionLabels[transaction.type]}
                    </Badge>
                  </div>
                </div>

                <p
                  className={`shrink-0 text-sm font-semibold ${
                    isPositive ? "text-success" : "text-danger"
                  }`}
                >
                  {amountPrefix}{formatMoney(Math.abs(transaction.amount))}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
