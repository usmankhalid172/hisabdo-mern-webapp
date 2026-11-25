'use client';

import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  ArrowRightLeft,
  FileText,
  MessageCircle,
} from 'lucide-react';
import type { Customer } from '@/services/hisabdoService';
import { Card } from '@/components/ui/design-system/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface CustomerCardProps {
  customer: Customer;
  balance: number;
  formattedBalance: string;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onRecordPayment: (customer: Customer) => void;
  whatsappUrl?: string;
}

export default function CustomerCard({
  customer,
  balance,
  formattedBalance,
  onEdit,
  onDelete,
  onRecordPayment,
  whatsappUrl,
}: CustomerCardProps) {
  const balanceStatus =
    balance > 0
      ? { label: 'Lene Hain', variant: 'success' as const }
      : balance < 0
        ? { label: 'Dene Hain', variant: 'warning' as const }
        : { label: 'Settled', variant: 'neutral' as const };

  const initials = customer.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-sm font-bold text-success">
            {initials}
          </div>

          <div className="min-w-0">
            <Link
              href={`/customers/${customer.id}`}
              className="truncate text-base font-semibold text-primary hover:text-success"
            >
              {customer.name}
            </Link>
            <p className="mt-1 text-xs text-secondary">Customer</p>
          </div>
        </div>

        <Badge variant={balanceStatus.variant}>
          {balanceStatus.label}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-secondary">
        <div className="flex items-center gap-2">
          <Phone size={15} />
          <span className="truncate">{customer.phone?.trim() || 'Not added'}</span>
        </div>

        <div className="flex items-center gap-2">
          <Mail size={15} />
          <span className="truncate">{customer.email?.trim() || 'Not added'}</span>
        </div>

        <div className="flex items-center gap-2">
          <MapPin size={15} />
          <span className="line-clamp-2">{customer.address?.trim() || 'Not added'}</span>
        </div>

        <div className="flex items-start gap-2">
          <FileText size={15} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{customer.notes?.trim() || 'Not added'}</span>
        </div>
      </div>

      <div className="mt-auto border-t border-border-color pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-sm text-secondary">Net Khata Balance</span>
          <span className="text-sm font-semibold text-primary">
            {formattedBalance}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/customers/${customer.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-color px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-muted"
          >
            <ArrowRightLeft size={14} />
            View Ledger
          </Link>

          <Button
            variant="secondary"
            size="sm"
            icon={Pencil}
            onClick={() => onEdit(customer)}
          >
            Edit
          </Button>

          <button
            type="button"
            onClick={() => onRecordPayment(customer)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-success px-3 py-2 text-xs font-bold text-black hover:bg-success/90"
          >
            <ArrowRightLeft size={14} />
            Record Payment
          </button>

          {customer.phone && whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border-color px-3 py-2 text-xs font-semibold text-primary hover:bg-surface-muted"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border-color px-3 py-2 text-xs font-semibold text-secondary opacity-50"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDelete(customer)}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-danger hover:bg-danger/10"
        >
          <Trash2 size={14} />
          Delete Customer
        </button>
      </div>
    </Card>
  );
}
