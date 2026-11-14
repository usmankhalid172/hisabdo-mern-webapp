'use client';

import { useEffect, useState } from 'react';
import type { Customer } from '@/services/hisabdoService';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export interface CustomerFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
  opening_balance: string;
  notes: string;
}

interface CustomerFormProps {
  initialValues?: Partial<Customer>;
  onSubmit: (values: CustomerFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: CustomerFormValues = {
  name: '',
  phone: '',
  email: '',
  address: '',
  opening_balance: '0',
  notes: '',
};

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Customer',
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormValues>({
    ...defaultValues,
    ...initialValues,
    opening_balance: String(initialValues?.opening_balance ?? 0),
  });

  useEffect(() => {
    setFormData({
      ...defaultValues,
      ...initialValues,
      opening_balance: String(initialValues?.opening_balance ?? 0),
    });
  }, [
    initialValues?.id,
    initialValues?.name,
    initialValues?.phone,
    initialValues?.email,
    initialValues?.address,
    initialValues?.opening_balance,
    initialValues?.notes,
  ]);

  const handleChange = (
    field: keyof CustomerFormValues,
    value: string
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Customer Name"
          placeholder="Enter customer name"
          value={formData.name}
          onChange={(event) => handleChange('name', event.target.value)}
          required
          disabled={isSubmitting}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="Enter phone number"
          value={formData.phone}
          onChange={(event) => handleChange('phone', event.target.value)}
          disabled={isSubmitting}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter email address"
          value={formData.email}
          onChange={(event) => handleChange('email', event.target.value)}
          disabled={isSubmitting}
        />

        <Input
          label="Opening Balance"
          type="number"
          step="any"
          placeholder="0"
          value={formData.opening_balance}
          onChange={(event) =>
            handleChange('opening_balance', event.target.value)
          }
          helperText="Use a negative value for payable balance."
          disabled={isSubmitting}
        />
      </div>

      <Textarea
        label="Address"
        placeholder="Enter customer address"
        rows={2}
        value={formData.address}
        onChange={(event) => handleChange('address', event.target.value)}
        disabled={isSubmitting}
      />

      <Textarea
        label="Notes"
        placeholder="Additional customer information (optional)"
        rows={3}
        value={formData.notes}
        onChange={(event) => handleChange('notes', event.target.value)}
        disabled={isSubmitting}
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
