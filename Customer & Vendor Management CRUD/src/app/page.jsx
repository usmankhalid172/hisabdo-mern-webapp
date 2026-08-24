'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Truck, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, DollarSign, Database, Sparkles, BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function HomePage() {
  const highlights = [
    { title: 'Customer Udhar Ledger', desc: 'Manage customer credit accounts, track receivables, set credit limits, and record payments with dynamic running balances.', icon: Users, link: '/dashboard/customers', color: '#3b82f6', badge: 'Receivables' },
    { title: 'Vendor / Supplier Ledger', desc: 'Track supplier bills, raw material purchases, payment vouchers, bank details, and overdue payables.', icon: Truck, link: '/dashboard/vendors', color: '#f59e0b', badge: 'Payables' },
    { title: 'Zod Validation Engine', desc: 'Strict Pakistani cellular validation (+923xxxxxxxxx / 0300...), positive amount checking, and structured HTTP error responses.', icon: ShieldCheck, link: '/dashboard/customers', color: '#10b981', badge: 'Security' },
    { title: 'WhatsApp Dues & Vouchers', desc: '1-Click pre-filled Urdu and English dues reminder generator for customers and payment voucher notices for suppliers.', icon: Sparkles, link: '/dashboard/customers', color: '#8b5cf6', badge: 'Automation' }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem 5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 700, marginBottom: '1.25rem' }}>
          <Sparkles size={16} /> Days 15–22 Capstone: Customer & Vendor Management CRUD
        </div>

        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-1px' }}>
          Dual-Party Financial Accounting <br />
          <span style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #34d399 50%, #f59e0b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Customers (Udhar) & Vendors (Payables)
          </span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
          Complete full-stack CRUD system with Zod schema validations, Pakistani telecommunication formatting, Mongoose database models, running net balances, WhatsApp dues reminders, and printable statements.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/dashboard/customers" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">
              Launch Customer Ledger (Receivables) <ArrowRight size={18} />
            </Button>
          </Link>
          <Link href="/dashboard/vendors" style={{ textDecoration: 'none' }}>
            <Button variant="amber" size="lg">
              Launch Vendor Ledger (Payables) <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <Card key={i} borderLeftColor={h.color} style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${h.color === '#3b82f6' ? '59, 130, 246' : h.color === '#f59e0b' ? '245, 158, 11' : h.color === '#10b981' ? '16, 185, 129' : '139, 92, 246'}, 0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: h.color }}>
                  <Icon size={24} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1' }}>
                  {h.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>{h.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>{h.desc}</p>
              <Link href={h.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: h.color, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                Explore Module <ArrowRight size={14} />
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
