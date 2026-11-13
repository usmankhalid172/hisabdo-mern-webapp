'use client';

import React, { forwardRef } from 'react';
import { useFormFieldContext, FormField } from './FormField';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Error state flag or error message node */
  error?: boolean | React.ReactNode;
  /** Optional icon displayed at the start of the input */
  icon?: React.ComponentType<{ className?: string; size?: number | string }>;
  /** Optional label: if provided, wraps the control in FormField */
  label?: React.ReactNode;
  /** Optional helper text: if provided, wraps the control in FormField */
  helperText?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

const InputBase = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      type = 'text',
      disabled,
      required,
      readOnly,
      error,
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
    const inputId = id || fieldContext?.id;
    const describedBy = ariaDescribedbyProp || fieldContext?.describedBy;
    const ariaInvalid = ariaInvalidProp ?? (isError ? 'true' : undefined);
    const ariaRequired = ariaRequiredProp ?? (isRequired ? 'true' : undefined);

    const inputClasses = [
      'w-full bg-surface text-[var(--text-primary)] border rounded-control py-2.5 text-sm',
      'placeholder:text-[var(--text-secondary)]/60',
      'transition duration-150 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
      'read-only:cursor-default read-only:bg-surface-muted/50',
      Icon ? 'ps-10 pe-3.5' : 'ps-3.5 pe-3.5',
      isError
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-[var(--border-color)]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const control = (
      <input
        ref={ref}
        id={inputId}
        type={type}
        disabled={isDisabled}
        required={isRequired}
        readOnly={readOnly}
        aria-invalid={ariaInvalid}
        aria-describedby={describedBy}
        aria-required={ariaRequired}
        className={inputClasses}
        style={style}
        {...rest}
      />
    );

    if (Icon) {
      return (
        <div className="relative w-full">
          <div
            className={`absolute inset-y-0 start-0 ps-3.5 flex items-center pointer-events-none ${
              isError ? 'text-danger' : 'text-[var(--text-secondary)]'
            }`}
            aria-hidden="true"
          >
            <Icon size={18} className="w-4 h-4" />
          </div>
          {control}
        </div>
      );
    }

    return control;
  }
);

InputBase.displayName = 'InputBase';

export const Input = forwardRef<HTMLInputElement, InputProps>(
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
          <InputBase
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
      <InputBase
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

Input.displayName = 'Input';

export default Input;
