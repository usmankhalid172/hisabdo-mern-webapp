'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Building2, CreditCard, DollarSign, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function AddVendorModal({ isOpen, onClose, onSuccess }) {
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
    initialBalance: '0',
    paymentTermsDays: '30'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    { value: 'Multan', label: 'Multan' },
    { value: 'Islamabad', label: 'Islamabad' }
  ];

  const bankOptions = [
    { value: 'Meezan Bank Ltd', label: 'Meezan Bank Ltd' },
    { value: 'Bank Alfalah Ltd', label: 'Bank Alfalah Ltd' },
    { value: 'Habib Bank Ltd (HBL)', label: 'Habib Bank Ltd (HBL)' },
    { value: 'MCB Bank Ltd', label: 'MCB Bank Ltd' },
    { value: 'United Bank Ltd (UBL)', label: 'United Bank Ltd (UBL)' },
    { value: 'Faysal Bank', label: 'Faysal Bank' },
    { value: 'Allied Bank Ltd (ABL)', label: 'Allied Bank Ltd (ABL)' }
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
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.fieldErrors) {
          setErrors(data.fieldErrors);
        } else {
          setErrors({ general: data.error || 'Failed to register vendor' });
        }
        setLoading(false);
        return;
      }

      setLoading(false);
      onSuccess(data.data);
      onClose();
      // Reset form
      setFormData({
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
        initialBalance: '0',
        paymentTermsDays: '30'
      });
    } catch (err) {
      setErrors({ general: 'Network connection failed' });
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Vendor / Supplier Profile" maxWidth="620px">
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Supplier Company / Mill / Shop Name"
            name="companyName"
            placeholder="e.g. National Textiles Mills"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            icon={Building2}
            required
          />

          <Input
            label="Contact Person / Proprietor Name"
            name="name"
            placeholder="e.g. Haji Abdul Rehman"
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
            placeholder="+923001234567 or 03001234567"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            helperText="Format: +923xxxxxxxxx or 03xxxxxxxxx"
            icon={Phone}
            required
          />

          <Input
            label="Email Address (Optional)"
            name="email"
            type="email"
            placeholder="supplier@company.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Vendor Supply Category"
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
          label="Factory / Warehouse Address"
          name="address"
          placeholder="e.g. Plot 24, Industrial Area Sector 5"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          icon={MapPin}
        />

        {/* Bank Details for Direct Supplier Transfer */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CreditCard size={15} /> Supplier Bank Details (For Payment Vouchers)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Select
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              options={bankOptions}
            />

            <Input
              label="Account Title"
              name="accountTitle"
              placeholder="e.g. National Textile Mills Pvt Ltd"
              value={formData.accountTitle}
              onChange={handleChange}
              error={errors.accountTitle}
            />
          </div>
          <Input
            label="Account / IBAN Number"
            name="accountNumber"
            placeholder="e.g. PK36MEZN0001020304050607"
            value={formData.accountNumber}
            onChange={handleChange}
            error={errors.accountNumber}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            label="Opening Payable Balance (PKR)"
            name="initialBalance"
            type="number"
            placeholder="0"
            value={formData.initialBalance}
            onChange={handleChange}
            error={errors.initialBalance}
            icon={DollarSign}
            helperText="Positive = You Owe Supplier, Negative = Advance"
          />

          <Input
            label="Payment Terms (Days)"
            name="paymentTermsDays"
            type="number"
            placeholder="30"
            value={formData.paymentTermsDays}
            onChange={handleChange}
            error={errors.paymentTermsDays}
            helperText="Agreed credit period in days"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="amber" size="md" type="submit" loading={loading} icon={Plus}>
            Save Vendor Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
