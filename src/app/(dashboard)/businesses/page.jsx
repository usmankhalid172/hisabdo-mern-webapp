'use client';

import React, { useState } from 'react';
import { Building2, Plus, CheckCircle, Edit, Trash2, MapPin } from 'lucide-react';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { SuccessBanner } from '@/components/ui/StateAlert';

export default function BusinessesPage() {
  const { activeBranch, setActiveBranch } = useAuth();
  const [branches, setBranches] = useState([
    { id: 'branch-1', name: 'Hamza Retail & Khata Traders — Main Branch', location: 'Hafeez Centre, Lahore', type: 'Electronics & Retail', cashBalance: 185400 },
    { id: 'branch-2', name: 'Hamza Wholesale Warehouse', location: 'Circular Road, Lahore', type: 'Wholesale Depot', cashBalance: 320000 },
    { id: 'branch-3', name: 'Rawalpindi Satellite Outlet', location: 'Bank Road, Saddar', type: 'Mobile & Accessories', cashBalance: 45000 }
  ]);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Retail');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newBranch = {
      id: 'branch-' + Date.now(),
      name: name.trim(),
      location: location.trim() || 'Lahore',
      type,
      cashBalance: 0
    };

    setBranches([...branches, newBranch]);
    setName('');
    setLocation('');
    setSuccessMsg(`Branch "${newBranch.name}" created successfully.`);
  };

  const handleSwitch = (b) => {
    setActiveBranch(b);
    setSuccessMsg(`Switched active context to ${b.name}`);
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="purple" style={{ marginBottom: '0.4rem' }}>Module 3: Multi-Branch Engine</Badge>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white' }}>Multi-Business Branches</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Manage multiple stores or warehouses and switch active branch context seamlessly.</p>
        </div>
      </div>

      <SuccessBanner message={successMsg} onDismiss={() => setSuccessMsg('')} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* CREATE BRANCH */}
        <Card>
          <CardHeader title="Register New Branch" subtitle="Add another shop or warehouse location" icon={Plus} />
          <CardBody>
            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <Input label="Branch / Store Name" placeholder="e.g. Islamabad Outlet" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="City / Location" placeholder="e.g. Blue Area, Islamabad" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input label="Business Type" placeholder="e.g. Wholesale, Retail" value={type} onChange={(e) => setType(e.target.value)} />
              <div style={{ marginBottom: '1rem' }}>
                <Button type="submit" variant="primary" style={{ width: '100%' }}>Add Branch</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* BRANCH DIRECTORY */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {branches.map((b) => {
            const isActive = activeBranch?.id === b.id;
            return (
              <Card key={b.id} style={{ border: isActive ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.08)', background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(15, 23, 42, 0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{b.name}</h3>
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                      <MapPin size={14} /> {b.location}
                    </div>
                  </div>
                  {isActive ? (
                    <Badge variant="green">Active Branch</Badge>
                  ) : (
                    <Badge variant="blue">{b.type}</Badge>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cash Position</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>Rs. {b.cashBalance.toLocaleString()}</div>
                  </div>
                  {!isActive && (
                    <Button variant="secondary" size="sm" onClick={() => handleSwitch(b)}>
                      Switch to Branch
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
