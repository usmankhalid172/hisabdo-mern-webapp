'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Truck, ArrowUpRight, ArrowDownLeft, DollarSign, TrendingUp, RefreshCw, Plus, Sparkles, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/StateAlert';

export default function DashboardOverviewPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingState message="Loading Financial Overview..." />;
  }

  const statCards = [
    {
      title: 'Total Customers (Accounts)',
      value: stats?.totalCustomers || 0,
      sub: 'Active debtor accounts',
      icon: Users,
      color: '#3b82f6',
      link: '/dashboard/customers',
      btnText: 'Manage Customers'
    },
    {
      title: 'Total Udhar (Receivable)',
      value: `Rs. ${(stats?.totalReceivable || 0).toLocaleString()}`,
      sub: 'Market owes you (Customers)',
      icon: ArrowUpRight,
      color: '#10b981',
      link: '/dashboard/customers',
      btnText: 'View Udhar Ledger'
    },
    {
      title: 'Total Vendors / Suppliers',
      value: stats?.totalVendors || 0,
      sub: 'Active supplier accounts',
      icon: Truck,
      color: '#f59e0b',
      link: '/dashboard/vendors',
      btnText: 'Manage Suppliers'
    },
    {
      title: 'Total Supplier Payables',
      value: `Rs. ${(stats?.totalPayable || 0).toLocaleString()}`,
      sub: 'You owe suppliers (Bills)',
      icon: ArrowDownLeft,
      color: '#ef4444',
      link: '/dashboard/vendors',
      btnText: 'View Supplier Payables'
    }
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Customer & Vendor Financial Dashboard
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Real-time dual-party financial position across customer receivables and supplier payables.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" onClick={handleSeed} loading={seeding} icon={Sparkles}>
            Seed Demo Merchants
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchStats} icon={RefreshCw}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Net Market Financial Position Card */}
      <Card style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Net Market Position (Receivables − Payables)
            </div>
            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: (stats?.netMarketPosition || 0) >= 0 ? '#34d399' : '#f87171', marginTop: '0.25rem' }}>
              Rs. {Math.abs(stats?.netMarketPosition || 0).toLocaleString()}
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#94a3b8', marginLeft: '0.65rem' }}>
                {(stats?.netMarketPosition || 0) >= 0 ? '(Net Surplus / In Flow)' : '(Net Deficit / Out Flow)'}
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Calculated across <strong>{stats?.totalCustomers} customers</strong> and <strong>{stats?.totalVendors} suppliers</strong>.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href="/dashboard/customers" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="md" icon={Users}>
                Customer Udhar Module →
              </Button>
            </Link>
            <Link href="/dashboard/vendors" style={{ textDecoration: 'none' }}>
              <Button variant="amber" size="md" icon={Truck}>
                Vendor Supplier Module →
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={i} borderLeftColor={c.color}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{c.title}</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `rgba(255, 255, 255, 0.08)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                  <Icon size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
                {c.sub}
              </div>
              <Link href={c.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 700, color: c.color, textDecoration: 'none' }}>
                {c.btnText} →
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
