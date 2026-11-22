import React from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { Card } from "@/components/ui/design-system/Card";

interface SummaryCardsProps {
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalCashIn,
  totalCashOut,
  netBalance,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-32 bg-surface-muted rounded-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="p-6 rounded-card border border-border bg-surface shadow-card">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Total Receivables (Cash In)</span>
          <ArrowUpRight className="w-4 h-4 text-success" />
        </div>
        <p className="text-2xl font-bold text-success mt-2">
          Rs. {totalCashIn.toLocaleString()}
        </p>
        <span className="text-xs text-muted-foreground">Across active entries</span>
      </Card>

      <Card className="p-6 rounded-card border border-border bg-surface shadow-card">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Total Payables (Cash Out)</span>
          <ArrowDownLeft className="w-4 h-4 text-danger" />
        </div>
        <p className="text-2xl font-bold text-danger mt-2">
          Rs. {totalCashOut.toLocaleString()}
        </p>
        <span className="text-xs text-muted-foreground">Across outgoing expenses</span>
      </Card>

      <Card className="p-6 rounded-card border border-border bg-surface shadow-card">
        <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>Net Balance</span>
          <Wallet className="w-4 h-4 text-info" />
        </div>
        <p className={`text-2xl font-bold mt-2 ${netBalance >= 0 ? "text-foreground" : "text-danger"}`}>
          Rs. {netBalance.toLocaleString()}
        </p>
        <span className="text-xs text-muted-foreground">
          {netBalance >= 0 ? "Positive net liquidity" : "Deficit balance"}
        </span>
      </Card>
    </div>
  );
};
