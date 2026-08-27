'use client';

import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Card } from '../../../Customers & Khata CRUD/src/components/ui/Card';
import Button from '../../../Customers & Khata CRUD/src/components/ui/Button';
import Badge from '../../../Customers & Khata CRUD/src/components/ui/Badge';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '3rem auto', padding: '1rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Badge variant="green" style={{ marginBottom: '0.5rem' }}>Transparent Pakistani Pricing</Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Simple, Merchant-Friendly Plans</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>No hidden charges. Start free and upgrade as your ledger grows.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Free Starter</h3>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'white', margin: '1rem 0' }}>Rs. 0 <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ month</span></div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Ideal for single shop owners</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '2rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> Up to 50 Customers</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> Unlimited Cashbook Entries</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> WhatsApp Dues Reminders</li>
          </ul>
          <Link href="/register"><Button variant="secondary" style={{ width: '100%' }}>Get Started Free</Button></Link>
        </Card>

        <Card style={{ padding: '2rem', border: '2px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
          <Badge variant="purple" style={{ marginBottom: '0.5rem' }}>Most Popular</Badge>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>Pro Merchant</h3>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#60a5fa', margin: '1rem 0' }}>Rs. 1,499 <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ month</span></div>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>For growing wholesale & retail shops</p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '2rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> Unlimited Customers & Khata</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> Multi-Branch Switching (5 Branches)</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> PDF & CSV Statement Exports</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><Check size={16} color="#34d399" /> Priority Support on WhatsApp</li>
          </ul>
          <Link href="/register"><Button variant="primary" style={{ width: '100%' }}>Upgrade to Pro</Button></Link>
        </Card>
      </div>
    </div>
  );
}
