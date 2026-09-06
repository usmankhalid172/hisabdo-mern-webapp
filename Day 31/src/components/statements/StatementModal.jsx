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
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>
                Hamza Traders & Wholesale Enterprise
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Hafeez Centre, Main Boulevard, Gulberg III, Lahore • Phone: 0300-1234567
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                <ShieldCheck size={14} /> Verified Account Statement
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                Generated on: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Party Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: 'rgba(30, 41, 59, 0.4)', padding: '1rem', borderRadius: '8px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Account Holder:</span>
              <strong style={{ fontSize: '0.95rem', color: 'white' }}>{party.name}</strong>
              {party.companyName && <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{party.companyName}</div>}
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Mobile / Phone:</span>
              <strong style={{ fontSize: '0.95rem', color: 'white' }}>{party.phone}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Location / City:</span>
              <strong style={{ fontSize: '0.95rem', color: 'white' }}>{party.city}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Net Balance Status:</span>
              <strong style={{ fontSize: '1.05rem', color: balance > 0 ? (isCustomer ? '#f87171' : '#f59e0b') : balance < 0 ? '#34d399' : '#94a3b8' }}>
                Rs. {balanceAmount.toLocaleString()} {balance > 0 ? (isCustomer ? '(Receivable / Udhar)' : '(Payable / Supplier Dues)') : balance < 0 ? '(Advance Paid)' : '(Settled)'}
              </strong>
            </div>
          </div>
        </div>

        {/* Transactions Table Preview */}
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Type</th>
                <th style={{ padding: '0.65rem 0.85rem' }}>Bill/Voucher #</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount (PKR)</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: idx % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'transparent' }}>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ padding: '0.65rem 0.85rem' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: (e.type === 'GAVE_CREDIT' || e.type === 'PURCHASE_BILL') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: (e.type === 'GAVE_CREDIT' || e.type === 'PURCHASE_BILL') ? '#f87171' : '#34d399'
                    }}>
                      {e.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>{e.billNumber || '-'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: 'white' }}>
                    Rs. {Number(e.amount).toLocaleString()}
                  </td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                    Rs. {Number(e.balanceAfter).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <Button variant="secondary" size="md" onClick={handleExportCSV} icon={Download}>
            Export to CSV Data
          </Button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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
