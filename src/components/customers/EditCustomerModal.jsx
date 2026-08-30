'use client';

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, MapPin, DollarSign, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function EditCustomerModal({ isOpen, onClose, customer, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    category: 'Retail',
    creditLimit: '50000',
    status: 'active',
    paymentTermsDays: '15'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || 'Lahore',
        category: customer.category || 'Retail',
        creditLimit: String(customer.creditLimit || 50000),
        status: customer.status || 'active',
        paymentTermsDays: String(customer.paymentTermsDays || 15)
      });
      setErrors({});
    }
  }, [customer]);

  const categoryOptions = [
    { value: 'Retail', label: 'Retailer (Standard Store)' },
    { value: 'Wholesale', label: 'Wholesaler (Bulk Buyer)' },
    { value: 'Distributor', label: 'Regional Distributor' },
    { value: 'VIP', label: 'VIP Priority Customer' },
    { value: 'General', label: 'General / Walk-in' }
  ];

  const cityOptions = [
    { value: 'Lahore', label: 'Lahore' },
    { value: 'Karachi', label: 'Karachi' },
    { value: 'Islamabad', label: 'Islamabad' },
    { value: 'Rawalpindi', label: 'Rawalpindi' },
    { value: 'Faisalabad', label: 'Faisalabad' },
    { value: 'Multan', label: 'Multan' },
    { value: 'Peshawar', label: 'Peshawar' },
    { value: 'Quetta', label: 'Quetta' },
    { value: 'Sialkot', label: 'Sialkot' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active Account' },
    { value: 'inactive', label: 'Inactive / Dormant' },
    { value: 'blocked', label: 'Blocked / Delinquent' }
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
    if (!customer) return;
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to update customer' });
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Customer: ${customer?.name || ''}`} maxWidth="600px">
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <Input
          label="Customer / Business Contact Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          icon={User}
          required
        />

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Credit Limit (PKR)"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={handleChange}
            error={errors.creditLimit}
            icon={DollarSign}
          />

          <Select
            label="Account Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>

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
