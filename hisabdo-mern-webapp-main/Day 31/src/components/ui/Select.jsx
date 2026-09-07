'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  style = {}
}) {
  return (
    <div style={{ marginBottom: '1rem', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field ${error ? 'input-error' : ''}`}
        style={{
          borderColor: error ? '#ef4444' : undefined,
          cursor: 'pointer',
          ...style
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0f172a', color: 'white' }}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
          <AlertCircle size={13} /> {error}
        </div>
      )}
    </div>
  );
}
