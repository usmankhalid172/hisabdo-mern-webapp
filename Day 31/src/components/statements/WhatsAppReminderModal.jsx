'use client';

import React, { useState } from 'react';
import { MessageSquare, Copy, ExternalLink, Check, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function WhatsAppReminderModal({ isOpen, onClose, party, partyType = 'Customer' }) {
  const [templateType, setTemplateType] = useState('polite');
  const [copied, setCopied] = useState(false);

  if (!party) return null;

  const isCustomer = partyType === 'Customer';
  const balance = isCustomer ? party.netBalance : party.payableBalance;
  const balanceAmount = Math.abs(balance || 0);

  const formattedPhone = (party.phone || '').replace(/[^0-9]/g, '');
  const cleanPkPhone = formattedPhone.startsWith('03') 
    ? '92' + formattedPhone.substring(1) 
    : formattedPhone.startsWith('3') 
      ? '92' + formattedPhone 
      : formattedPhone;

  // Customer Templates
  const customerTemplates = {
    polite: `Assalam-o-Alaikum ${party.name} Sahab,\n\nThis is a friendly reminder from Hamza Traders & Wholesale Enterprise regarding your pending HisabDo ledger balance of Rs. ${balanceAmount.toLocaleString()}.\n\nKindly arrange the payment at your earliest convenience. Shukriya!\n\nHamza Traders\nHafeez Centre, Lahore`,
    urgent: `Muhtaram ${party.name} Sahab,\n\nYour HisabDo credit ledger shows an overdue balance of Rs. ${balanceAmount.toLocaleString()}.\n\nBank Account Details for Online Transfer:\nBank: Meezan Bank Ltd\nAccount: 0102-0103445588\nTitle: Hamza Traders & Enterprise\n\nPlease share the payment screenshot once transferred. JazakAllah!\n\nContact: 0300-1234567`,
    statement: `HisabDo Dues Statement:\nCustomer: ${party.name}\nPhone: ${party.phone}\nTotal Outstanding Due: Rs. ${balanceAmount.toLocaleString()}\nCredit Limit: Rs. ${(party.creditLimit || 0).toLocaleString()}\nDate: ${new Date().toLocaleDateString()}\n\nPlease verify and clear the ledger balance.\nRegards, Hamza Traders`
  };

  // Vendor Templates
  const vendorTemplates = {
    polite: `Assalam-o-Alaikum ${party.name} Sahab (${party.companyName}),\n\nThis is regarding our ongoing supplier account with your esteemed company. Our records show a pending bill balance of Rs. ${balanceAmount.toLocaleString()}.\n\nPayment is being scheduled as per our ${party.paymentTermsDays || 30}-day credit terms.\n\nRegards,\nHamza Traders & Wholesale Enterprise`,
    urgent: `Payment Voucher Confirmation:\nSupplier: ${party.companyName}\nProprietor: ${party.name}\nAccount Balance: Rs. ${balanceAmount.toLocaleString()}\nBank: ${party.bankName || 'Meezan Bank Ltd'}\nAccount Title: ${party.accountTitle || party.companyName}\nAccount #: ${party.accountNumber || '-'}\n\nWe have scheduled the bank transfer installment for this invoice.\n\nRegards, Accounts Dept - Hamza Enterprise`,
    statement: `Supplier Account Ledger Reconciliation:\nCompany: ${party.companyName}\nContact: ${party.name} (${party.phone})\nTotal Verified Payables: Rs. ${balanceAmount.toLocaleString()}\nDate: ${new Date().toLocaleDateString()}\n\nRegards,\nHamza Traders & Wholesale Enterprise`
  };

  const currentTemplates = isCustomer ? customerTemplates : vendorTemplates;
  const currentMessage = currentTemplates[templateType] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const encoded = encodeURIComponent(currentMessage);
    const url = `https://wa.me/${cleanPkPhone}?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCustomer ? `💬 WhatsApp Dues Reminder: ${party.name}` : `💬 WhatsApp Supplier Notice: ${party.companyName}`}
      maxWidth="580px"
    >
      <div>
        {/* Template Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setTemplateType('polite')}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: templateType === 'polite' ? '#3b82f6' : 'transparent',
              color: templateType === 'polite' ? 'white' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🤝 {isCustomer ? 'Friendly Reminder' : 'Standard Notice'}
          </button>
          <button
            type="button"
            onClick={() => setTemplateType('urgent')}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: templateType === 'urgent' ? (isCustomer ? '#ef4444' : '#f59e0b') : 'transparent',
              color: templateType === 'urgent' ? 'white' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            {isCustomer ? '⚠️ Overdue & Bank' : '💳 Bank Voucher'}
          </button>
          <button
            type="button"
            onClick={() => setTemplateType('statement')}
            style={{
              padding: '0.5rem',
              borderRadius: '6px',
              border: 'none',
              background: templateType === 'statement' ? '#8b5cf6' : 'transparent',
              color: templateType === 'statement' ? 'white' : '#94a3b8',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            📄 Formal Summary
          </button>
        </div>

        {/* Message Preview Box */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>
              <MessageSquare size={16} /> WhatsApp Message Preview ({party.phone})
            </div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Pending: <strong>Rs. {balanceAmount.toLocaleString()}</strong>
            </span>
          </div>

          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.88rem',
            color: '#e2e8f0',
            lineHeight: 1.6
          }}>
            {currentMessage}
          </pre>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <Button variant="secondary" size="md" onClick={handleCopy} icon={copied ? Check : Copy}>
            {copied ? 'Copied to Clipboard!' : 'Copy Text'}
          </Button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" size="md" onClick={onClose}>
              Close
            </Button>
            <Button variant="success" size="md" onClick={handleOpenWhatsApp} icon={ExternalLink}>
              Launch WhatsApp Web →
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
