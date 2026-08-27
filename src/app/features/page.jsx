'use client';

import React from 'react';
import { Users, BookOpen, Building2, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Card } from '../../../Customers & Khata CRUD/src/components/ui/Card';
import Badge from '../../../Customers & Khata CRUD/src/components/ui/Badge';

export default function FeaturesPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '3rem auto', padding: '1rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Badge variant="purple" style={{ marginBottom: '0.5rem' }}>Enterprise Khata Engine</Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>HisabDo Feature Suite</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
          Tailored accounting, customer ledgers, and multi-store control for Pakistani retail businesses.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '1.75rem', borderTop: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Customer / Khata CRUD</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>Full CRUD database operations with Zod validation, Pakistani phone regex (+923xxxxxxxxx), and automatic running balance tracking.</p>
        </Card>

        <Card style={{ padding: '1.75rem', borderTop: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>WhatsApp Statement Generator</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>Pre-filled polite and urgent dues reminder templates in Urdu & English with 1-click WhatsApp Web launch.</p>
        </Card>

        <Card style={{ padding: '1.75rem', borderTop: '4px solid #8b5cf6' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Multi-Business Context</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>Manage main shop, warehouse depot, and satellite outlets under a single authenticated merchant account.</p>
        </Card>
      </div>
    </div>
  );
}
