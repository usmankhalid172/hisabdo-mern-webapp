'use client';

import React, { useState } from 'react';
import { DollarSign, FileText, Calendar, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function AddCustomerTransactionModal({ isOpen, onClose, customer, defaultType = 'GAVE_CREDIT', onSuccess }) {
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    billNumber: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Sync defaultType when opening
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      type: defaultType,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      billNumber: '',
      description: ''
    }));
    setErrors({});
  }, [defaultType, isOpen]);

  if (!customer) return null;

  const paymentMethodOptions = [
    { value: 'Cash', label: 'Cash In Hand' },
    { value: 'Bank Transfer', label: 'Online Bank Transfer' },
    { value: 'EasyPaisa', label: 'EasyPaisa Mobile Wallet' },
    { value: 'JazzCash', label: 'JazzCash Mobile Wallet' },
    { value: 'Cheque', label: 'Bank Cheque' },
    { value: 'Credit Card', label: 'Credit / Debit Card' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = {
        partyType: 'Customer',
        customerId: customer._id,
        type: formData.type,
        amount: Number(formData.amount),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        billNumber: formData.billNumber,
        description: formData.description
      };

      const res = await fetch(`/api/customers/${customer._id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to record transaction' });
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(data.data, data.customer);
      onClose();
    } catch (err) {
      setErrors({ general: 'Network connection failed' });
      setLoading(false);
    }
  };

  const isCredit = formData.type === 'GAVE_CREDIT';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCredit ? `🔴 You Gave Udhar (Credit) to ${customer.name}` : `🟢 You Got Wasooli (Payment) from ${customer.name}`}
      maxWidth="550px"
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        {/* Transaction Type Segmented Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.35rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, type: 'GAVE_CREDIT' }))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: isCredit ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'transparent',
              color: isCredit ? 'white' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              boxShadow: isCredit ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowUpRight size={18} /> You Gave (Udhar)
          </button>

          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, type: 'GOT_PAYMENT' }))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: !isCredit ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'transparent',
              color: !isCredit ? 'white' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              boxShadow: !isCredit ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowDownLeft size={18} /> You Got (Wasooli)
          </button>
        </div>

        {/* Current Net Balance Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Current Customer Net Balance:</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: customer.netBalance > 0 ? '#f87171' : customer.netBalance < 0 ? '#34d399' : '#94a3b8' }}>
            Rs. {Math.abs(customer.netBalance).toLocaleString()} {customer.netBalance > 0 ? '(Receivable)' : customer.netBalance < 0 ? '(Advance)' : '(Settled)'}
          </span>
        </div>

        <Input
          label="Transaction Amount (PKR)"
          name="amount"
          type="number"
          placeholder="e.g. 15000"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          icon={DollarSign}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Transaction Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            icon={Calendar}
            required
          />

          <Select
            label="Payment Method"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            options={paymentMethodOptions}
          />
        </div>

        <Input
          label="Bill / Invoice / Receipt #"
          name="billNumber"
          placeholder="e.g. INV-9042 or REC-102"
          value={formData.billNumber}
          onChange={handleChange}
          error={errors.billNumber}
          icon={FileText}
        />

        <Input
          label="Item Details / Remarks / Notes"
          name="description"
          placeholder="e.g. 5 Cartons Cloth consignment delivered via Goods Transport"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={isCredit ? 'danger' : 'success'} size="md" type="submit" loading={loading} icon={Plus}>
            Save {isCredit ? 'Credit Entry (Udhar)' : 'Payment Entry (Wasooli)'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
