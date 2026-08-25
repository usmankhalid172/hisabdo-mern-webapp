'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../Customers & Khata CRUD/src/components/ui/Card';
import Button from '../../../Customers & Khata CRUD/src/components/ui/Button';
import Input from '../../../Customers & Khata CRUD/src/components/ui/Input';
import Badge from '../../../Customers & Khata CRUD/src/components/ui/Badge';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '1rem' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Badge variant="blue" style={{ marginBottom: '0.5rem' }}>Support & Helpdesk</Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white' }}>Get in Touch with HisabDo</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>We're here to assist Pakistani merchants 24/7.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.25rem' }}>Contact Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: '#cbd5e1', fontSize: '0.92rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="#60a5fa" />
              <span>hisabdo.app@gmail.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} color="#34d399" />
              <span>+92 (300) 123-4567</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={18} color="#c084fc" />
              <span>Hafeez Centre, Main Boulevard, Lahore, Pakistan</span>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '2rem' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={48} color="#34d399" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ color: 'white', fontWeight: 700 }}>Message Received!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Our merchant support team will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <Input label="Your Name" placeholder="Muhammad Hamza" required />
              <Input label="Email / Phone" placeholder="hamza@merchant.com or 0300..." required />
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>Message</label>
                <textarea rows={3} placeholder="How can we assist your business?" className="input-field" required />
              </div>
              <Button type="submit" variant="primary" icon={Send} style={{ width: '100%' }}>Send Message</Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
