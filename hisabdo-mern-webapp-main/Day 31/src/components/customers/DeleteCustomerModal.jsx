'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DeleteCustomerModal({ isOpen, onClose, customer, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!customer) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete customer');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(customer._id);
      onClose();
    } catch (err) {
      setError('Network connection error');
      setLoading(false);
    }
  };

  const hasBalance = customer.netBalance !== 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Customer Account" maxWidth="500px">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <AlertTriangle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Permanent Cascade Deletion Warning</div>
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.2rem' }}>
              Deleting <strong>{customer.name}</strong> will also permanently purge all associated ledger entries and transaction history.
            </div>
          </div>
        </div>

        {hasBalance && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: '#fbbf24', fontSize: '0.85rem' }}>
            ⚠️ <strong>Active Balance Warning:</strong> This account currently has an unsettled balance of <strong>Rs. {Math.abs(customer.netBalance).toLocaleString()}</strong> ({customer.netBalance > 0 ? 'Customer Owes You' : 'Advance Paid'}).
          </div>
        )}

        {error && (
          <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Are you sure you want to proceed with deleting <strong>{customer.name}</strong> ({customer.phone})? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} loading={loading} icon={Trash2}>
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
