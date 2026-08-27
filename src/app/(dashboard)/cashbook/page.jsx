'use client';

import React, { useState } from 'react';
import { BookOpen, PlusCircle, MinusCircle, Edit, Trash2, Calendar, FileText, Download } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../../../Customers & Khata CRUD/src/components/ui/Card';
import Button from '../../../../Customers & Khata CRUD/src/components/ui/Button';
import Input from '../../../../Customers & Khata CRUD/src/components/ui/Input';
import Table from '../../../../Customers & Khata CRUD/src/components/ui/Table';
import Badge from '../../../../Customers & Khata CRUD/src/components/ui/Badge';
import Modal from '../../../../Customers & Khata CRUD/src/components/ui/Modal';
import { SuccessBanner } from '../../../../Customers & Khata CRUD/src/components/ui/StateAlert';

export default function CashbookPage() {
  const [entries, setEntries] = useState([
    { id: 1, type: 'in', amount: 35000, category: 'Counter Daily Sales', description: 'Cash collected from counter', date: '2026-08-19', balanceAfter: 35000 },
    { id: 2, type: 'out', amount: 4500, category: 'Shop Utilities', description: 'Electricity bill payment', date: '2026-08-19', balanceAfter: 30500 },
    { id: 3, type: 'in', amount: 12000, category: 'Udhar Recovery', description: 'Recovery from Ali Traders', date: '2026-08-19', balanceAfter: 42500 }
  ]);

  const [type, setType] = useState('in');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Daily Sales');
  const [description, setDescription] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const totalIn = entries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0);
  const totalOut = entries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0);
  const netCash = totalIn - totalOut;

  const handleAddEntry = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;

    const newBalance = type === 'in' ? (entries.length > 0 ? entries[entries.length - 1].balanceAfter + amt : amt) : (entries.length > 0 ? entries[entries.length - 1].balanceAfter - amt : -amt);

    const newEntry = {
      id: Date.now(),
      type,
      amount: amt,
      category,
      description: description.trim() || (type === 'in' ? 'Cash In' : 'Cash Out'),
      date: new Date().toISOString().split('T')[0],
      balanceAfter: newBalance
    };

    setEntries([...entries, newEntry]);
    setAmount('');
    setDescription('');
    setSuccessMsg(`Cash ${type === 'in' ? 'In' : 'Out'} of Rs. ${amt.toLocaleString()} recorded.`);
  };

  const handleDelete = (id) => {
    setEntries(entries.filter(e => e.id !== id));
    setSuccessMsg('Cashbook entry deleted.');
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="blue" style={{ marginBottom: '0.4rem' }}>Module 1: Cash Management</Badge>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white' }}>Digital Cashbook</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Track cash flow, daily receipts, shop expenses, and closing balance.</p>
        </div>
      </div>

      <SuccessBanner message={successMsg} onDismiss={() => setSuccessMsg('')} />

      {/* METRIC ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1.2rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>Total Cash In</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
            Rs. {totalIn.toLocaleString()}
          </div>
        </Card>
        <Card style={{ padding: '1.2rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 700 }}>Total Cash Out</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
            Rs. {totalOut.toLocaleString()}
          </div>
        </Card>
        <Card style={{ padding: '1.2rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 700 }}>Net Cash In Hand</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', marginTop: '0.2rem' }}>
            Rs. {netCash.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* FORM AND TABLE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Card>
          <CardHeader title="Record Cash Transaction" subtitle="Enter daily cash income or expenses" icon={BookOpen} />
          <CardBody>
            <form onSubmit={handleAddEntry} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 600 }}>Entry Type</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => setType('in')} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: type === 'in' ? '#10b981' : 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>🟢 Cash In (+)</button>
                  <button type="button" onClick={() => setType('out')} style={{ flex: 1, padding: '0.65rem', borderRadius: '8px', border: 'none', background: type === 'out' ? '#ef4444' : 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 700, cursor: 'pointer' }}>🔴 Cash Out (-)</button>
                </div>
              </div>

              <Input label="Amount (PKR)" type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              <Input label="Category" placeholder="e.g. Sale, Tea, Salary" value={category} onChange={(e) => setCategory(e.target.value)} />
              <Input label="Remarks" placeholder="e.g. Cash from customer" value={description} onChange={(e) => setDescription(e.target.value)} />

              <div style={{ marginBottom: '1rem' }}>
                <Button type="submit" variant={type === 'in' ? 'success' : 'danger'} style={{ width: '100%' }}>
                  Save Entry
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cash Transactions Register" subtitle="Filterable ledger history" icon={Calendar} />
          <CardBody>
            <Table
              columns={[
                { header: 'Date' },
                { header: 'Type' },
                { header: 'Category' },
                { header: 'Remarks' },
                { header: 'Amount (PKR)', align: 'right' },
                { header: 'Actions', align: 'center' }
              ]}
              data={entries}
              renderRow={(e) => (
                <>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{e.date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={e.type === 'in' ? 'green' : 'red'}>{e.type === 'in' ? '🟢 Cash In' : '🔴 Cash Out'}</Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'white', fontWeight: 600 }}>{e.category}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{e.description}</td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: e.type === 'in' ? '#34d399' : '#f87171' }}>
                    {e.type === 'in' ? '+' : '-'} Rs. {e.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button onClick={() => handleDelete(e.id)} style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', color: '#f87171', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </>
              )}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
