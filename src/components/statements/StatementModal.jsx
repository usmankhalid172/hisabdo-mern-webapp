'use client';

import React from 'react';
import { Download, Printer, ShieldCheck, Building2, User, Phone, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function StatementModal({ isOpen, onClose, party, partyType = 'Customer', entries = [] }) {
  if (!party) return null;

  const isCustomer = partyType === 'Customer';
  const balance = isCustomer ? party.netBalance : party.payableBalance;
  const balanceAmount = Math.abs(balance || 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Party Type', 'Transaction Type', 'Amount (PKR)', 'Payment Method', 'Bill/Invoice #', 'Description', 'Balance After (PKR)'];
    const rows = entries.map(e => [
      new Date(e.date).toLocaleDateString(),
      e.partyType,
      e.type,
      e.amount,
      e.paymentMethod,
      e.billNumber || '-',
      `"${(e.description || '').replace(/"/g, '""')}"`,
      e.balanceAfter
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${(party.companyName || party.name).replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Ledger Statement: ${party.companyName || party.name}`}
      maxWidth="780px"
    >
      <div>
        {/* Printable Header */}
        <div className="mb-6 rounded-card border border-border bg-surface-raised p-6">
          <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="text-xl font-extrabold text-foreground">
                Hamza Traders & Wholesale Enterprise
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Hafeez Centre, Main Boulevard, Gulberg III, Lahore • Phone: 0300-1234567
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 rounded-control bg-info/10 px-2.5 py-1 text-xs font-bold text-info">
                <ShieldCheck size={14} /> Verified Account Statement
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Generated on: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Party Details Grid */}
          <div className="grid gap-4 rounded-card bg-surface-muted p-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div>
              <span className="block text-xs text-muted-foreground">Account Holder:</span>
              <strong className="text-base text-foreground">{party.name}</strong>
              {party.companyName && <div className="text-sm text-info">{party.companyName}</div>}
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">Mobile / Phone:</span>
              <strong className="text-base text-foreground">{party.phone}</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">Location / City:</span>
              <strong className="text-base text-foreground">{party.city}</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">Net Balance Status:</span>
              <strong className={`text-lg ${balance > 0 ? (isCustomer ? 'text-danger' : 'text-warning') : balance < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                Rs. {balanceAmount.toLocaleString()} {balance > 0 ? (isCustomer ? '(Receivable / Udhar)' : '(Payable / Supplier Dues)') : balance < 0 ? '(Advance Paid)' : '(Settled)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Transactions Table Preview */}
        <div className="mb-6 max-h-[300px] overflow-y-auto rounded-card border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-left text-muted-foreground">
                <th className="px-3.5 py-2.5">Date</th>
                <th className="px-3.5 py-2.5">Type</th>
                <th className="px-3.5 py-2.5">Bill/Voucher #</th>
                <th className="px-3.5 py-2.5 text-right">Amount (PKR)</th>
                <th className="px-3.5 py-2.5 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={idx} className="border-b border-border">
                  <td className="px-3.5 py-2.5 text-muted-foreground">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-3.5 py-2.5">
                    <span className={`rounded-control px-2 py-1 text-xs font-semibold ${e.type === 'GAVE_CREDIT' || e.type === 'PURCHASE_BILL' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                      {e.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-muted-foreground">{e.billNumber || '-'}</td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-foreground">
                    Rs. {Number(e.amount).toLocaleString()}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-bold text-info">
                    Rs. {Number(e.balanceAfter).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="secondary" size="md" onClick={handleExportCSV} icon={Download}>
            Export to CSV Data
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" size="md" onClick={handlePrint} icon={Printer}>
              Print Official Statement
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
