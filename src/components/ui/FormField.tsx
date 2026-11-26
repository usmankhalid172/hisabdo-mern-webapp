'use client';

import React, { createContext, useContext, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface FormFieldContextValue {
  id: string;
  error?: React.ReactNode;
  isError: boolean;
  required?: boolean;
  disabled?: boolean;
  errorId?: string;
  helperId?: string;
  describedBy?: string;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export function useFormFieldContext() {
  return useContext(FormFieldContext);
}

export interface FormFieldProps {
  /** Optional explicit ID for linking label and control. Defaults to auto-generated ID */
  id?: string;
  /** Label text or element */
  label?: React.ReactNode;
  /** Helper text displayed below the control */
  helperText?: React.ReactNode;
  /** Error message displayed below the control */
  error?: React.ReactNode;
  /** Shows required indicator and sets aria-required */
  required?: boolean;
  /** Disabled state applied to label and passed down to controls */
  disabled?: boolean;
  /** Custom class name for the wrapper */
  className?: string;
  /** Form control(s) */
  children: React.ReactNode;
}

export function FormField({
  id,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  className = '',
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const errorId = error ? `${controlId}-error` : undefined;
  const helperId = helperText ? `${controlId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;
  const isError = Boolean(error);

  const contextValue: FormFieldContextValue = {
    id: controlId,
    error,
    isError,
    required,
    disabled,
    errorId,
    helperId,
    describedBy,
  };

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={`w-full flex flex-col space-y-1.5 ${className}`.trim()}>
        {label && (
          <label
            htmlFor={controlId}
            className={`block text-xs font-semibold text-[var(--text-primary)] select-none ${
              disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`.trim()}
          >
            <span>{label}</span>
            {required && (
              <>
                <span className="text-danger ms-1" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </>
            )}
          </label>
        )}

        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              id: (children.props as any).id || controlId,
              disabled: (children.props as any).disabled ?? disabled,
              required: (children.props as any).required ?? required,
              error: (children.props as any).error ?? isError,
              'aria-invalid':
                (children.props as any)['aria-invalid'] ?? (isError ? 'true' : undefined),
              'aria-describedby':
                (children.props as any)['aria-describedby'] || describedBy,
              'aria-required':
                (children.props as any)['aria-required'] ?? (required ? 'true' : undefined),
            })
          : children}

        {helperText && (
          <p
            id={helperId}
            className="text-xs text-[var(--text-secondary)] mt-1"
          >
            {helperText}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="text-xs text-danger flex items-center gap-1.5 font-medium mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}
      </div>
    </FormFieldContext.Provider>
  );
}

export default FormField;
