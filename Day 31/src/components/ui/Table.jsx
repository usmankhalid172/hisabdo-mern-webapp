'use client';

import React from 'react';
import { EmptyState } from './StateAlert';

export default function Table({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item._id || item.id || index,
  renderRow,
  emptyTitle = 'No Records Found',
  emptyMessage = 'No records match your criteria.',
  onEmptyAction
}) {
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} onAction={onEmptyAction} />;
  }

  return (
    <div className="horizontal-scroll-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <table style={{ width: '100%', minWidth: '550px', borderCollapse: 'separate', borderSpacing: '0 0.5rem' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  textAlign: col.align || 'left',
                  padding: '0.75rem 1rem',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr
              key={keyExtractor(item, idx)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                borderRadius: '10px',
                transition: 'background 0.2s ease'
              }}
            >
              {renderRow(item, idx)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
