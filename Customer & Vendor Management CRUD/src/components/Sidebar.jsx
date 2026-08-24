'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Truck, ShieldCheck, Database, RefreshCw, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { activeBranch } = useAuth();

  const links = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard, badge: 'Overview' },
    { name: 'Customers (Receivables)', path: '/dashboard/customers', icon: Users, badge: 'Udhar' },
    { name: 'Vendors (Payables)', path: '/dashboard/vendors', icon: Truck, badge: 'Suppliers' }
  ];

  const isActive = (path) => pathname === path;

  return (
    <aside
      className="sidebar-aside"
      style={{
        width: '280px',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minHeight: 'calc(100vh - 72px)'
      }}
    >
      {/* Active Business Switcher Header */}
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0.85rem',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.2rem' }}>
          Active Merchant Enterprise
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeBranch.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          {activeBranch.location}
        </div>
      </div>

      {/* Main Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', paddingLeft: '0.5rem', marginBottom: '0.25rem' }}>
          Core Ledgers & Parties
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.path);
          return (
            <Link
              key={link.path}
              href={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                textDecoration: 'none',
                background: active ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'transparent',
                border: active ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                color: active ? '#60a5fa' : '#94a3b8',
                fontWeight: active ? 700 : 500,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={active ? '#60a5fa' : '#64748b'} />
                <span>{link.name}</span>
              </div>
              {link.badge && (
                <span style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '6px',
                  background: active ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                  color: active ? 'white' : '#94a3b8',
                  fontWeight: 600
                }}>
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Database & Zod Status Widget */}
      <div style={{
        marginTop: 'auto',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          <ShieldCheck size={16} /> Zod & DB Validated
        </div>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
          Pakistani mobile format validation (<code style={{ color: '#38bdf8' }}>+923xxxxxxxxx</code>) & dual-party ledger balance calculations active.
        </p>
      </div>
    </aside>
  );
}
