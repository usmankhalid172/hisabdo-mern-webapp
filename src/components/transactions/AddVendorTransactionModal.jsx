'use client';

import React, { useState } from 'react';
import { DollarSign, FileText, Calendar, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function AddVendorTransactionModal({ isOpen, onClose, vendor, defaultType = 'PURCHASE_BILL', onSuccess }) {
  const [formData, setFormData] = useState({
    type: defaultType,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    billNumber: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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

  if (!vendor) return null;

  const paymentMethodOptions = [
    { value: 'Bank Transfer', label: 'Online Bank Transfer' },
    { value: 'Cash', label: 'Cash In Hand' },
    { value: 'Cheque', label: 'Bank Cheque' },
    { value: 'EasyPaisa', label: 'EasyPaisa Mobile Wallet' },
    { value: 'JazzCash', label: 'JazzCash Mobile Wallet' },
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
        partyType: 'Vendor',
        vendorId: vendor._id,
        type: formData.type,
        amount: Number(formData.amount),
        date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        billNumber: formData.billNumber,
        description: formData.description
      };

      const res = await fetch(`/api/vendors/${vendor._id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to record supplier transaction' });
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(data.data, data.vendor);
      onClose();
    } catch (err) {
      setErrors({ general: 'Network connection failed' });
      setLoading(false);
    }
  };

  const isPurchase = formData.type === 'PURCHASE_BILL';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPurchase ? `📦 Add Supplier Purchase Bill: ${vendor.companyName}` : `💸 Record Payment Paid to ${vendor.companyName}`}
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
            onClick={() => setFormData(p => ({ ...p, type: 'PURCHASE_BILL' }))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: isPurchase ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
              color: isPurchase ? 'white' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              boxShadow: isPurchase ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowUpRight size={18} /> Purchase Bill (Payable +)
          </button>

          <button
            type="button"
            onClick={() => setFormData(p => ({ ...p, type: 'PAID_PAYMENT' }))}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              background: !isPurchase ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'transparent',
              color: !isPurchase ? 'white' : '#94a3b8',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.9rem',
              boxShadow: !isPurchase ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowDownLeft size={18} /> Paid to Supplier (Adaigi -)
          </button>
        </div>

        {/* Current Payable Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Current Supplier Dues:</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: vendor.payableBalance > 0 ? '#f59e0b' : vendor.payableBalance < 0 ? '#34d399' : '#94a3b8' }}>
            Rs. {Math.abs(vendor.payableBalance).toLocaleString()} {vendor.payableBalance > 0 ? '(You Owe)' : vendor.payableBalance < 0 ? '(Advance Paid)' : '(Settled)'}
          </span>
        </div>

        <Input
          label="Bill / Payment Amount (PKR)"
          name="amount"
          type="number"
          placeholder="e.g. 45000"
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          icon={DollarSign}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            icon={Calendar}
            required
          />

          <Select
            label="Payment Mode"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            options={paymentMethodOptions}
          />
        </div>

        <Input
          label="Supplier Invoice / Gate Pass / Voucher #"
          name="billNumber"
          placeholder="e.g. BILL-491 or VOUCHER-101"
          value={formData.billNumber}
          onChange={handleChange}
          error={errors.billNumber}
          icon={FileText}
        />

        <Input
          label="Material / Supply Description"
          name="description"
          placeholder="e.g. 50 Rolls Silk fabric delivered by Goods Transport"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={isPurchase ? 'amber' : 'success'} size="md" type="submit" loading={loading} icon={Plus}>
            Save {isPurchase ? 'Purchase Bill' : 'Supplier Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
