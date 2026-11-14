'use client';

import { Phone, Mail, MapPin, Pencil } from 'lucide-react';
import type { Customer } from '@/services/hisabdoService';
import { Card } from '@/components/ui/design-system/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CustomerCardProps {
  customer: Customer;
  balance: number;
  formattedBalance: string;
  onEdit: (customer: Customer) => void;
}

export default function CustomerCard({
  customer,
  balance,
  formattedBalance,
  onEdit,
}: CustomerCardProps) {
  const balanceStatus =
    balance > 0
      ? { label: 'Receivable', variant: 'success' as const }
      : balance < 0
        ? { label: 'Payable', variant: 'warning' as const }
        : { label: 'Settled', variant: 'neutral' as const };

  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-primary">
            {customer.name}
          </h3>
          <p className="mt-1 text-xs text-secondary">
            Customer
          </p>
        </div>

        <Badge variant={balanceStatus.variant}>
          {balanceStatus.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-secondary">
        {customer.phone && (
          <div className="flex items-center gap-2">
            <Phone size={15} />
            <span className="truncate">{customer.phone}</span>
          </div>
        )}

        {customer.email && (
          <div className="flex items-center gap-2">
            <Mail size={15} />
            <span className="truncate">{customer.email}</span>
          </div>
        )}

        {customer.address && (
          <div className="flex items-center gap-2">
            <MapPin size={15} />
            <span className="line-clamp-2">{customer.address}</span>
          </div>
        )}
      </div>

      <div className="mt-auto border-t border-border-color pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm text-secondary">Balance</span>
          <span className="text-sm font-semibold text-primary">
            {formattedBalance}
          </span>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Pencil}
          className="w-full"
          onClick={() => onEdit(customer)}
        >
          Edit Customer
        </Button>
      </div>
    </Card>
  );
}
