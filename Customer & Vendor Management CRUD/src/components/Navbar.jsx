'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Menu, X, Lock, LogOut, Users, Truck, LayoutDashboard } from 'lucide-react';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Dashboard Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers (Receivables)', path: '/dashboard/customers', icon: Users },
    { name: 'Vendors (Payables)', path: '/dashboard/vendors', icon: Truck }
  ];

  const isActive = (path) => pathname === path;

  return (
    <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 50, width: '100%' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
          }}>
            <BookOpen size={22} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              Hisab<span style={{ color: '#3b82f6' }}>Do</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.5px' }}>
              CUSTOMER & VENDOR CRUD (DAYS 15–22)
            </div>
          </div>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="mobile-hide">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              style={{
                textDecoration: 'none',
                color: isActive(link.path) ? '#60a5fa' : '#94a3b8',
                fontWeight: isActive(link.path) ? 700 : 500,
                fontSize: '0.9rem',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              {link.name}
              {isActive(link.path) && (
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: '#3b82f6',
                  borderRadius: '2px'
                }} />
              )}
            </Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }} className="mobile-hide">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/dashboard/customers" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="sm">Open Customer Udhar →</Button>
              </Link>
              <Link href="/dashboard/vendors" style={{ textDecoration: 'none' }}>
                <Button variant="amber" size="sm">Open Vendor Payables →</Button>
              </Link>
              <button
                onClick={logout}
                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.45rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600 }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="sm" icon={Lock}>Sign In</Button>
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ display: 'none', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem' }}
          className="mobile-show"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="animate-fade-in" style={{
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{ textDecoration: 'none', color: isActive(link.path) ? '#60a5fa' : '#cbd5e1', fontWeight: 600, fontSize: '1.05rem', padding: '0.5rem 0' }}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
