'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, BookOpen, Building2, TrendingUp, TrendingDown, 
  ArrowUpRight, ArrowDownLeft, Sparkles, PlusCircle, ArrowRight,
  ShieldCheck, Database, FileText
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

export default function DashboardOverviewPage() {
  const { user, activeBranch } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 5,
    totalReceivable: 61450,
    totalPayable: 5200,
    netMarketPosition: 56250,
    settledCount: 1,
    totalTransactions: 7
  });

  useEffect(() => {
    fetch('/api/customers/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setStats(data.data);
      })
      .catch(err => console.error('Stats error:', err));
  }, []);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      {/* WELCOME BANNER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <Badge variant="purple">Day 15-19: CRUD Specialist Focus</Badge>
            <Badge variant="blue">{activeBranch ? activeBranch.name : 'Main Branch'}</Badge>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white' }}>
            Welcome back, {user ? user.name : 'Merchant'} 👋
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Complete Customer Directory & Khata Udhar Management Module with live DB and Zod validations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/dashboard/customers">
            <Button variant="primary" icon={Users}>
              Manage Customers & Khata →
            </Button>
          </Link>
        </div>
      </div>

      {/* OVERVIEW STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700 }}>Total Registered Customers</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', marginTop: '0.35rem' }}>
            {stats.totalCustomers} Accounts
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Connected to Live Database Store
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Total Market Receivable (Udhar)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '0.35rem' }}>
            Rs. {stats.totalReceivable.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            You Will Get from customers
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 700 }}>Total Market Payable (Advance)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f87171', marginTop: '0.35rem' }}>
            Rs. {stats.totalPayable.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            You Will Give to customers
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', fontWeight: 700 }}>Net Balance Position</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: stats.netMarketPosition >= 0 ? '#34d399' : '#f87171', marginTop: '0.35rem' }}>
            Rs. {Math.abs(stats.netMarketPosition).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            {stats.netMarketPosition >= 0 ? 'Surplus Market Debt' : 'Advance Deposits'}
          </div>
        </Card>
      </div>

      {/* QUICK LAUNCH TILES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Module 1 Focus Tile */}
        <Card style={{ borderTop: '4px solid #3b82f6' }}>
          <CardHeader
            title="🤝 Customers & Khata Udhar Book (Specialty)"
            subtitle="Full CRUD, Zod Validations, and Running Ledger Balances"
            icon={Users}
          />
          <CardBody>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Access the complete Pakistani customer directory, record You Gave (Credit) vs You Got (Payment) entries, send WhatsApp dues notices, and download statements.
            </p>
            <Link href="/dashboard/customers" style={{ textDecoration: 'none' }}>
              <Button variant="primary" style={{ width: '100%' }} icon={ArrowRight}>
                Launch Customer & Khata Workspace
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Module 2 Tile */}
        <Card style={{ borderTop: '4px solid #10b981' }}>
          <CardHeader
            title="📖 Digital Daily Cashbook"
            subtitle="Record Cash In and Cash Out Entries"
            icon={BookOpen}
          />
          <CardBody>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Daily shop cash flow ledger with filters by category (Sale, Expense, Supplier) and running balance calculations.
            </p>
            <Link href="/dashboard/cashbook" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" style={{ width: '100%' }} icon={ArrowRight}>
                Open Daily Cashbook
              </Button>
            </Link>
          </CardBody>
        </Card>

        {/* Module 3 Tile */}
        <Card style={{ borderTop: '4px solid #8b5cf6' }}>
          <CardHeader
            title="🏢 Multi-Business Branch Management"
            subtitle="Manage multiple shops with active branch context"
            icon={Building2}
          />
          <CardBody>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Create multiple shop profiles, switch active branch context on 1-click, and manage distinct cash registers.
            </p>
            <Link href="/dashboard/businesses" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" style={{ width: '100%' }} icon={ArrowRight}>
                Manage Branch Profiles
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
