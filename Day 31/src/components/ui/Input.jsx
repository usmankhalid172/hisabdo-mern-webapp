'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  required = false,
  disabled = false,
  helperText,
  style = {}
}) {
  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: error ? '#ef4444' : '#64748b' }}>
            <Icon size={18} />
          </div>
        )}

        <input
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`input-field ${error ? 'input-error' : ''}`}
          style={{
            paddingLeft: Icon ? '2.75rem' : '1rem',
            borderColor: error ? '#ef4444' : undefined,
            ...style
          }}
        />
      </div>

      {error ? (
        <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <AlertCircle size={13} /> {error}
        </div>
      ) : helperText ? (
        <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.35rem' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
}
