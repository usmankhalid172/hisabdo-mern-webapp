"use client";

import React from "react";
import { Card } from "@/components/ui/design-system/Card";
import { CardBody } from "@/components/ui/design-system/CardBody";
import { Badge } from "@/components/ui/Badge";

interface SummaryProps {
  totalPurchases: number;
  totalPaymentsReceived: number;
  totalPaymentsSent: number;
  netBalance: number;
  formatMoney: (amount: number) => string;
}

export function CustomerBalanceSummary({
  totalPurchases,
  totalPaymentsReceived,
  totalPaymentsSent,
  netBalance,
  formatMoney,
}: SummaryProps) {
  const totalLene = totalPurchases + totalPaymentsSent;
  const totalDene = totalPaymentsReceived;
  const isReceivable = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardBody>
          <p className="text-xs font-bold text-muted-foreground mb-1">
            + Income (Lene / Receivable)
          </p>
          <p className="text-2xl font-black text-success">
            {formatMoney(totalLene)}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-xs font-bold text-muted-foreground mb-1">
            - Expense (Dene / Paid)
          </p>
          <p className="text-2xl font-black text-danger">
            {formatMoney(totalDene)}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <p className="text-xs font-bold text-muted-foreground mb-1">
            Net Balance (Khata Hisab)
          </p>
          <p
            className={`text-2xl font-black ${
              isReceivable ? "text-success" : "text-danger"
            }`}
          >
            {formatMoney(netBalance)}
          </p>
          <Badge
            variant={isReceivable ? "success" : "danger"}
            className="mt-2"
          >
            {isReceivable ? "Baqaya Lene Hain" : "Advance Jama Hain"}
          </Badge>
        </CardBody>
      </Card>
    </div>
  );
}