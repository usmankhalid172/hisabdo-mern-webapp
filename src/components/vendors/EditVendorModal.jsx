'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, Building2, CreditCard, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function EditVendorModal({ isOpen, onClose, vendor, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Karachi',
    category: 'Wholesale Supplier',
    bankName: 'Meezan Bank Ltd',
    accountTitle: '',
    accountNumber: '',
    status: 'active',
    paymentTermsDays: '30'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        companyName: vendor.companyName || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        city: vendor.city || 'Karachi',
        category: vendor.category || 'Wholesale Supplier',
        bankName: vendor.bankName || 'Meezan Bank Ltd',
        accountTitle: vendor.accountTitle || '',
        accountNumber: vendor.accountNumber || '',
        status: vendor.status || 'active',
        paymentTermsDays: String(vendor.paymentTermsDays || 30)
      });
      setErrors({});
    }
  }, [vendor]);

  const categoryOptions = [
    { value: 'Wholesale Supplier', label: 'Wholesale Supplier (Goods)' },
    { value: 'Raw Material', label: 'Raw Material Supplier' },
    { value: 'Finished Goods', label: 'Finished Goods Manufacturer' },
    { value: 'Packaging', label: 'Packaging & Cartons' },
    { value: 'Logistics', label: 'Logistics & Goods Forwarder' },
    { value: 'Services', label: 'Utility / Service Vendor' }
  ];

  const cityOptions = [
    { value: 'Karachi', label: 'Karachi' },
    { value: 'Lahore', label: 'Lahore' },
    { value: 'Faisalabad', label: 'Faisalabad' },
    { value: 'Peshawar', label: 'Peshawar' },
    { value: 'Sialkot', label: 'Sialkot' },
    { value: 'Gujranwala', label: 'Gujranwala' },
    { value: 'Multan', label: 'Multan' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active Supplier' },
    { value: 'inactive', label: 'Inactive / Archived' },
    { value: 'blocked', label: 'Blocked / Disputed' }
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
    if (!vendor) return;
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/vendors/${vendor._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to update vendor' });
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Supplier: ${vendor?.companyName || ''}`} maxWidth="620px">
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            icon={Building2}
            required
          />

          <Input
            label="Contact Person"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Pakistani Mobile Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categoryOptions}
          />

          <Select
            label="City"
            name="city"
            value={formData.city}
            onChange={handleChange}
            options={cityOptions}
          />
        </div>

        <Input
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          icon={MapPin}
        />

        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CreditCard size={15} /> Supplier Bank Details
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Account Title"
              name="accountTitle"
              value={formData.accountTitle}
              onChange={handleChange}
            />
            <Input
              label="Account / IBAN Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Account Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />

          <Input
            label="Payment Terms (Days)"
            name="paymentTermsDays"
            type="number"
            value={formData.paymentTermsDays}
            onChange={handleChange}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="amber" size="md" type="submit" loading={loading} icon={Save}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
