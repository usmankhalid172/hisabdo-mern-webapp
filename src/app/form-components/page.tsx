'use client';

import React, { useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  Mail,
  Search,
  Lock,
  Sun,
  Moon,
  Languages,
  DollarSign,
  CheckCircle,
} from 'lucide-react';

export default function FormComponentsPreviewPage() {
  const { theme, toggleTheme, isRTL, setLanguage, language } = useSettings();

  // Controlled states for demo
  const [inputValue, setInputValue] = useState('John Doe');
  const [selectValue, setSelectValue] = useState('retail');
  const [textareaValue, setTextareaValue] = useState('Payment received via online transfer.');

  const toggleLanguage = () => {
    setLanguage(language === 'ur' ? 'en' : 'ur');
  };

  const sampleOptions = [
    { value: 'retail', label: 'Retail Store' },
    { value: 'wholesale', label: 'Wholesale Distributor' },
    { value: 'manufacturing', label: 'Manufacturing Unit' },
    { value: 'services', label: 'Service Provider', disabled: true },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation & Controls Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-card bg-surface border border-[var(--border-color)] shadow-card">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">Design System Form Components</h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-control bg-primary/10 text-primary border border-primary/20">
                Active Theme: {theme.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verified with design tokens (`bg-surface`, `rounded-control`, `text-danger`, `border-danger`, `ring-primary`).
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-control bg-surface border border-[var(--border-color)] hover:bg-surface-muted transition cursor-pointer"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-control bg-surface border border-[var(--border-color)] hover:bg-surface-muted transition cursor-pointer"
            >
              <Languages size={15} />
              <span>{isRTL ? 'Switch to LTR (EN)' : 'Switch to RTL (UR)'}</span>
            </button>
          </div>
        </header>

        {/* SECTION 1: COMPONENT STATES COMPARISON MATRIX */}
        <section className="p-6 rounded-card bg-surface border border-[var(--border-color)] shadow-card space-y-6">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h2 className="text-base font-bold">1. Component States Grid (Input, Select, Textarea)</h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Comparing Normal, Required, Error, Disabled, and Read-Only states across all controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column A: Input */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary border-b border-[var(--border-color)] pb-1">
                Input.tsx
              </div>

              <FormField label="Normal Input" helperText="Standard text input">
                <Input placeholder="Enter business name..." />
              </FormField>

              <FormField label="With Icon (RTL-aware)" helperText="Uses ps-10 and start-0">
                <Input icon={Search} placeholder="Search customers..." />
              </FormField>

              <FormField label="Required Input" required helperText="Red asterisk & sr-only indicator">
                <Input icon={Mail} type="email" placeholder="owner@store.com" />
              </FormField>

              <FormField label="Error State" error="Invalid phone number format" required>
                <Input error={true} defaultValue="+92 300 000000" />
              </FormField>

              <FormField label="Disabled State" disabled helperText="Non-interactive control">
                <Input disabled defaultValue="Locked system field" />
              </FormField>

              <FormField label="Password Type">
                <Input icon={Lock} type="password" defaultValue="secretPassword123" />
              </FormField>
            </div>

            {/* Column B: Select */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary border-b border-[var(--border-color)] pb-1">
                Select.tsx
              </div>

              <FormField label="Normal Select" helperText="Native select with custom chevron">
                <Select placeholder="Choose an option..." options={sampleOptions} />
              </FormField>

              <FormField label="With Icon" helperText="Prefixed icon support">
                <Select icon={DollarSign} options={sampleOptions} defaultValue="retail" />
              </FormField>

              <FormField label="Required Select" required helperText="Validation indicator">
                <Select
                  required
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                  options={sampleOptions}
                />
              </FormField>

              <FormField label="Error State" error="Please select a business category" required>
                <Select error={true} placeholder="Select category..." options={sampleOptions} />
              </FormField>

              <FormField label="Disabled State" disabled helperText="Non-selectable dropdown">
                <Select disabled defaultValue="retail" options={sampleOptions} />
              </FormField>

              <FormField label="Direct Option Children" helperText="Supports direct <option> tags">
                <Select defaultValue="aud">
                  <option value="pkr">Pakistani Rupee (PKR)</option>
                  <option value="usd">US Dollar (USD)</option>
                  <option value="aud">Australian Dollar (AUD)</option>
                </Select>
              </FormField>
            </div>

            {/* Column C: Textarea */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-primary border-b border-[var(--border-color)] pb-1">
                Textarea.tsx
              </div>

              <FormField label="Normal Textarea" helperText="Multi-line input (3 rows default)">
                <Textarea placeholder="Enter transaction remarks or notes..." rows={3} />
              </FormField>

              <FormField label="Controlled Textarea" helperText="Syncs with state">
                <Textarea
                  rows={3}
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                />
              </FormField>

              <FormField label="Required Textarea" required helperText="Mandatory multi-line input">
                <Textarea rows={3} placeholder="Customer terms and conditions..." required />
              </FormField>

              <FormField label="Error State" error="Remarks are required when amount exceeds Rs. 50,000" required>
                <Textarea rows={3} error={true} placeholder="Explain reason for entry..." />
              </FormField>

              <FormField label="Disabled Textarea" disabled helperText="Read-only archived notes">
                <Textarea rows={3} disabled defaultValue="This khata record has been reconciled and archived." />
              </FormField>

              <FormField label="Read-Only Textarea" helperText="Selectable but non-editable">
                <Textarea rows={2} readOnly defaultValue="LIC-2026-HISABDO-PRO-ACTIVE" />
              </FormField>
            </div>
          </div>
        </section>

        {/* SECTION 2: COMPLETE REALISTIC FORM SHOWCASE (FormField Integration) */}
        <section className="p-6 rounded-card bg-surface border border-[var(--border-color)] shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
            <div>
              <h2 className="text-base font-bold">2. Complete Form Showcase (FormField Integration)</h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Demonstrates accessible ID association, live focus indicators, and semantic token consistency.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <CheckCircle size={15} />
              <span>Full Accessibility Compliant</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              id="form-customer-name"
              label="Customer / Supplier Name"
              required
              helperText="Full legal name as registered on CNIC"
            >
              <Input
                placeholder="e.g. Mian Traders Lahore"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </FormField>

            <FormField
              id="form-phone"
              label="Phone Number (WhatsApp Reminders)"
              required
              helperText="Used to send automated khata statements"
            >
              <Input type="tel" placeholder="0300-1234567" defaultValue="0300-7654321" />
            </FormField>

            <FormField
              id="form-account-type"
              label="Khata Account Type"
              required
              helperText="Determines credit or debit balance behavior"
            >
              <Select
                options={[
                  { value: 'customer', label: 'Customer (Gives Money / Dene Wala)' },
                  { value: 'supplier', label: 'Supplier (Takes Money / Lene Wala)' },
                ]}
                defaultValue="customer"
              />
            </FormField>

            <FormField
              id="form-credit-limit"
              label="Credit Limit (PKR)"
              helperText="Maximum allowed outstanding balance"
            >
              <Input icon={DollarSign} type="number" placeholder="50000" defaultValue="100000" />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                id="form-address"
                label="Store Address & Delivery Notes"
                helperText="Permanent location for deliveries and invoice dispatch"
              >
                <Textarea rows={3} placeholder="Shop #12, First Floor, Blue Area, Islamabad" />
              </FormField>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-xs font-semibold rounded-control bg-surface border border-[var(--border-color)] hover:bg-surface-muted transition cursor-pointer"
              >
                Reset Demo
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-control bg-primary text-white hover:opacity-95 transition shadow-card cursor-pointer"
              >
                Save Record
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
