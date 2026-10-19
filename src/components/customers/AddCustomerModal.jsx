'use client';

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Building, DollarSign, Plus } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

export default function AddCustomerModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Lahore',
    category: 'Retail',
    creditLimit: '50000',
    initialBalance: '0',
    paymentTermsDays: '15'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    { value: 'Sialkot', label: 'Sialkot' },
    { value: 'Gujranwala', label: 'Gujranwala' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = "Customer name is required.";
    }

    if (!formData.phone.trim()) {
      nextErrors.phone = "Mobile number is required.";
    }

    const limit = Number(formData.creditLimit);
    if (!Number.isFinite(limit) || limit < 0) {
      nextErrors.creditLimit = "Credit limit must be 0 or greater.";
    }

    const initBal = Number(formData.initialBalance);
    if (!Number.isFinite(initBal)) {
      nextErrors.initialBalance = "Please enter a valid opening balance.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("hisabdo_token")
          : null;

      const res = await fetch("/api/customers", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const message =
          data?.message ||
          data?.error ||
          (res.status === 401
            ? "Please log in again to continue."
            : res.status === 400
              ? "Customer creation failed because a required field is missing or invalid."
              : "Unable to save customer profile. Please try again.");

        const errs = { general: message };

        if (data?.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, msgs]) => {
            errs[field] = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
          });
        }

        setErrors(errs);
        setLoading(false);
        return;
      }

      const createdCustomer = data.customer || data.data;

      setLoading(false);

      if (typeof onSuccess === "function") {
        onSuccess(createdCustomer);
      }

      onClose();

      // Reset form
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
        city: "Lahore",
        category: "Retail",
        creditLimit: "50000",
        initialBalance: "0",
        paymentTermsDays: "15",
      });
    } catch (err) {
      console.error("Add customer network error:", err);
      setErrors({
        general:
          "Unable to connect to the server. Please check your connection and try again.",
      });
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      title="Register New Customer Profile"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
            {errors.general}
          </div>
        )}

        <Input
          label="Customer / Business Contact Name"
          name="name"
          placeholder="e.g. Malik Usman or Al-Rehman General Store"
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
            placeholder="customer@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Select
            label="Customer Category"
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
          label="Shop / Delivery Address"
          name="address"
          placeholder="e.g. Shop #14, Main Anarkali Bazaar"
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
            placeholder="50000"
            value={formData.creditLimit}
            onChange={handleChange}
            error={errors.creditLimit}
            icon={DollarSign}
            helperText="Maximum allowed udhar balance"
          />

          <Input
            label="Opening Balance (PKR)"
            name="initialBalance"
            type="number"
            placeholder="0"
            value={formData.initialBalance}
            onChange={handleChange}
            error={errors.initialBalance}
            icon={DollarSign}
            helperText="Positive = You Will Get, Negative = Advance"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Button variant="secondary" size="md" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" loading={loading} disabled={loading} icon={Plus}>
            Save Customer Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
}
