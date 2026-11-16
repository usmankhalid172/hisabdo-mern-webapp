'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFormFieldContext, FormField } from './FormField';

export interface SelectOption {
  value: string | number;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Array of select options */
  options?: SelectOption[];
  /** Placeholder option to display when value is empty */
  placeholder?: string;
  /** Error state flag or error message node */
  error?: boolean | React.ReactNode;
  /** Optional icon displayed at the start of the select */
  icon?: React.ComponentType<{ className?: string; size?: number | string }>;
  /** Optional label: if provided, wraps the control in FormField */
  label?: React.ReactNode;
  /** Optional helper text: if provided, wraps the control in FormField */
  helperText?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

const SelectBase = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      disabled,
      required,
      error,
      options,
      placeholder,
      children,
      icon: Icon,
      id,
      'aria-invalid': ariaInvalidProp,
      'aria-describedby': ariaDescribedbyProp,
      'aria-required': ariaRequiredProp,
      style,
      ...rest
    },
    ref
  ) => {
    const fieldContext = useFormFieldContext();

    const isError = Boolean(error ?? fieldContext?.isError);
    const isDisabled = disabled ?? fieldContext?.disabled ?? false;
    const isRequired = required ?? fieldContext?.required ?? false;
    const selectId = id || fieldContext?.id;
    const describedBy = ariaDescribedbyProp || fieldContext?.describedBy;
    const ariaInvalid = ariaInvalidProp ?? (isError ? 'true' : undefined);
    const ariaRequired = ariaRequiredProp ?? (isRequired ? 'true' : undefined);

    const selectClasses = [
      'w-full bg-surface text-[var(--text-primary)] border rounded-control py-2.5 text-sm',
      'transition duration-150 ease-in-out cursor-pointer appearance-none',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
      Icon ? 'ps-10' : 'ps-3.5',
      'pe-10', // Reserve space for trailing chevron
      isError
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-[var(--border-color)]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="relative w-full">
        {Icon && (
          <div
            className={`absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none ${
              isError ? 'text-danger' : 'text-[var(--text-secondary)]'
            }`}
            aria-hidden="true"
          >
            <Icon size={18} className="w-4 h-4" />
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={isDisabled}
          required={isRequired}
          aria-invalid={ariaInvalid}
          aria-describedby={describedBy}
          aria-required={ariaRequired}
          className={selectClasses}
          style={style}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden={isRequired}>
              {placeholder}
            </option>
          )}
          {options &&
            options.map((opt) => (
              <option
                key={String(opt.value)}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-surface text-[var(--text-primary)]"
              >
                {typeof opt.label === 'string' || typeof opt.label === 'number'
                  ? opt.label
                  : String(opt.value)}
              </option>
            ))}
          {children}
        </select>

        <div
          className="absolute inset-y-0 end-0 pe-3.5 flex items-center pointer-events-none text-[var(--text-secondary)]"
          aria-hidden="true"
        >
          <ChevronDown size={16} className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

SelectBase.displayName = 'SelectBase';

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, id, required, disabled, ...rest }, ref) => {
    const hasLabel = Boolean(label);
    const hasHelper = Boolean(helperText);
    const hasErrorString = typeof error === 'string' || React.isValidElement(error);

    if (hasLabel || hasHelper || hasErrorString) {
      return (
        <FormField
          id={id}
          label={label}
          helperText={helperText}
          error={hasErrorString ? error : undefined}
          required={required}
          disabled={disabled}
        >
          <SelectBase
            ref={ref}
            error={Boolean(error)}
            required={required}
            disabled={disabled}
            {...rest}
          />
        </FormField>
      );
    }

    return (
      <SelectBase
        ref={ref}
        id={id}
        error={error}
        required={required}
        disabled={disabled}
        {...rest}
      />
    );
  }
);

Select.displayName = 'Select';

export default Select;
