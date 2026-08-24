'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(9, 13, 22, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '3rem 1.5rem 1.5rem',
      marginTop: 'auto',
      color: '#94a3b8',
      fontSize: '0.85rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="white" />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white' }}>
              Hisab<span style={{ color: '#3b82f6' }}>Do</span>
            </div>
          </div>
          <p style={{ lineHeight: 1.6, color: '#64748b' }}>
            Next-generation MERN & Next.js Financial Accounting, Customer Ledger & Vendor Supply Chain Management Engine for Pakistani merchants and enterprises.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Customer Modules</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link href="/dashboard/customers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Customer Udhar Ledger</Link></li>
            <li><Link href="/dashboard/customers" style={{ color: '#94a3b8', textDecoration: 'none' }}>Zod Pakistani Phone Validation</Link></li>
            <li><Link href="/dashboard/customers" style={{ color: '#94a3b8', textDecoration: 'none' }}>WhatsApp Dues Reminders</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Vendor Modules</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link href="/dashboard/vendors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Vendor / Supplier Directory</Link></li>
            <li><Link href="/dashboard/vendors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Purchases & Bills Payable</Link></li>
            <li><Link href="/dashboard/vendors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Supplier Payment Vouchers</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Technical Verification</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={16} /> 38/38 Automated Tests Passed
          </div>
          <p style={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5 }}>
            Full CRUD REST API routes with Mongoose database models and Zod schema validations.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          &copy; 2026 HisabDo. Developed by <strong>Muhammad Hamza Arif</strong> (Days 15–22 Capstone).
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
          Crafted with <Heart size={14} color="#ef4444" fill="#ef4444" /> for Pakistani Retailers
        </div>
      </div>
    </footer>
  );
}
