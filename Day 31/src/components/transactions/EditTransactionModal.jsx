'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Calendar, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    paymentMethod: 'Cash',
    billNumber: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: String(transaction.amount || ''),
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        paymentMethod: transaction.paymentMethod || 'Cash',
        billNumber: transaction.billNumber || '',
        description: transaction.description || ''
      });
      setErrors({});
    }
  }, [transaction]);

  if (!transaction) return null;

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
        amount: Number(formData.amount),
        date: formData.date ? new Date(formData.date).toISOString() : transaction.date,
        paymentMethod: formData.paymentMethod,
        billNumber: formData.billNumber,
        description: formData.description
      };

      const res = await fetch(`/api/transactions/${transaction._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to update transaction' });
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(data.data);
      onClose();
    } catch (err) {
      setErrors({ general: 'Network connection failed' });
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Ledger Transaction Record" maxWidth="520px">
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <Input
          label="Transaction Amount (PKR)"
          name="amount"
          type="number"
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
          label="Bill / Invoice #"
          name="billNumber"
          value={formData.billNumber}
          onChange={handleChange}
          error={errors.billNumber}
          icon={FileText}
        />

        <Input
          label="Description / Notes"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading} icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
