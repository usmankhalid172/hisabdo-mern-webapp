'use client';

import React from 'react';
import { Smartphone, Download, ShieldCheck, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function DownloadPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '1rem', textAlign: 'center' }} className="animate-fade-in">
      <Badge variant="blue" style={{ marginBottom: '0.5rem' }}>PWA & Mobile Support</Badge>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Download HisabDo Mobile App</h1>
      <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Install HisabDo as a fast, offline-ready Progressive Web App (PWA) directly on Android and iOS devices.
      </p>

      <Card style={{ padding: '2.5rem' }}>
        <Smartphone size={56} color="#3b82f6" style={{ margin: '0 auto 1.25rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '0.75rem' }}>Android APK & Direct PWA</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>100% synchronized with your desktop merchant account and cloud database.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button variant="primary" icon={Download} onClick={() => alert('PWA Installer triggered.')}>Install Web App (PWA)</Button>
          <Button variant="secondary" onClick={() => alert('Direct Android APK download initiated.')}>Download Android APK</Button>
        </div>
      </Card>
    </div>
  );
}
