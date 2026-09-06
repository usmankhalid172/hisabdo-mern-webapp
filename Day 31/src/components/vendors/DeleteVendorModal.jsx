'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function DeleteVendorModal({ isOpen, onClose, vendor, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!vendor) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/vendors/${vendor._id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to delete vendor');
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(vendor._id);
      onClose();
    } catch (err) {
      setError('Network connection error');
      setLoading(false);
    }
  };

  const hasPayable = vendor.payableBalance !== 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Supplier / Vendor Profile" maxWidth="500px">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem' }}>
          <AlertTriangle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>Permanent Cascade Deletion Warning</div>
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', marginTop: '0.2rem' }}>
              Deleting supplier <strong>{vendor.companyName}</strong> will permanently remove all purchase bills and payment history for this vendor.
            </div>
          </div>
        </div>

        {hasPayable && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', color: '#fbbf24', fontSize: '0.85rem' }}>
            ⚠️ <strong>Pending Bill Balance:</strong> You currently have an unsettled balance of <strong>Rs. {Math.abs(vendor.payableBalance).toLocaleString()}</strong> with this supplier.
          </div>
        )}

        {error && (
          <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Are you sure you want to delete supplier <strong>{vendor.companyName}</strong> (Contact: {vendor.name})? This action cannot be reversed.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDelete} loading={loading} icon={Trash2}>
            Confirm Delete Supplier
          </Button>
        </div>
      </div>
    </Modal>
  );
}
