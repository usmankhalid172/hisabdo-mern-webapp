'use client';

import React, { forwardRef } from 'react';
import { useFormFieldContext, FormField } from './FormField';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Error state flag or error message node */
  error?: boolean | React.ReactNode;
  /** Optional label: if provided, wraps the control in FormField */
  label?: React.ReactNode;
  /** Optional helper text: if provided, wraps the control in FormField */
  helperText?: React.ReactNode;
  /** Custom class name */
  className?: string;
}

const TextareaBase = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className = '',
      rows = 3,
      disabled,
      required,
      readOnly,
      error,
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
    const textareaId = id || fieldContext?.id;
    const describedBy = ariaDescribedbyProp || fieldContext?.describedBy;
    const ariaInvalid = ariaInvalidProp ?? (isError ? 'true' : undefined);
    const ariaRequired = ariaRequiredProp ?? (isRequired ? 'true' : undefined);

    const textareaClasses = [
      'w-full bg-surface text-[var(--text-primary)] border rounded-control px-3.5 py-2.5 text-sm',
      'placeholder:text-[var(--text-secondary)]/60',
      'transition duration-150 ease-in-out resize-y min-h-[80px]',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-muted',
      'read-only:cursor-default read-only:bg-surface-muted/50',
      isError
        ? 'border-danger focus:border-danger focus:ring-danger'
        : 'border-[var(--border-color)]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={isDisabled}
        required={isRequired}
        readOnly={readOnly}
        aria-invalid={ariaInvalid}
        aria-describedby={describedBy}
        aria-required={ariaRequired}
        className={textareaClasses}
        style={style}
        {...rest}
      />
    );
  }
);

TextareaBase.displayName = 'TextareaBase';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
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
          <TextareaBase
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
      <TextareaBase
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

Textarea.displayName = 'Textarea';

export default Textarea;
