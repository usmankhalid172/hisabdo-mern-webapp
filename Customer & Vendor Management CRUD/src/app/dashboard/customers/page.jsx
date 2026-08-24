'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Plus, Phone, MapPin, DollarSign, Filter,
  ArrowUpRight, ArrowDownLeft, Edit2, Trash2, MessageSquare,
  FileText, Calendar, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import { LoadingState, EmptyState, SuccessBanner, ErrorState } from '../../../components/ui/StateAlert';
import AddCustomerModal from '../../../components/customers/AddCustomerModal';
import EditCustomerModal from '../../../components/customers/EditCustomerModal';
import DeleteCustomerModal from '../../../components/customers/DeleteCustomerModal';
import AddCustomerTransactionModal from '../../../components/transactions/AddCustomerTransactionModal';
import EditTransactionModal from '../../../components/transactions/EditTransactionModal';
import WhatsAppReminderModal from '../../../components/statements/WhatsAppReminderModal';
import StatementModal from '../../../components/statements/StatementModal';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [banner, setBanner] = useState(null);

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [isDeleteCustomerOpen, setIsDeleteCustomerOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState('GAVE_CREDIT');
  const [isEditTxOpen, setIsEditTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const fetchCustomers = async (selectedIdToKeep) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (balanceFilter !== 'all') params.set('balanceType', balanceFilter);

      const res = await fetch(`/api/customers?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setCustomers(data.data);
        if (data.data.length > 0) {
          const target = selectedIdToKeep 
            ? data.data.find(c => c._id === selectedIdToKeep) || data.data[0]
            : (selectedCustomer ? data.data.find(c => c._id === selectedCustomer._id) || data.data[0] : data.data[0]);
          setSelectedCustomer(target);
          if (target) {
            fetchCustomerTransactions(target._id);
          }
        } else {
          setSelectedCustomer(null);
          setTransactions([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async (customerId) => {
    try {
      setTxLoading(true);
      const res = await fetch(`/api/customers/${customerId}/transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        if (data.customer) {
          setSelectedCustomer(prev => prev ? { ...prev, ...data.customer } : data.customer);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [categoryFilter, balanceFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCustomerCreated = (newCust) => {
    setBanner({ type: 'success', title: 'Customer Registered', message: `${newCust.name} has been registered with mobile ${newCust.phone}.` });
    fetchCustomers(newCust._id);
  };

  const handleCustomerUpdated = (updatedCust) => {
    setBanner({ type: 'success', title: 'Profile Updated', message: `Customer ${updatedCust.name} profile was successfully updated.` });
    fetchCustomers(updatedCust._id);
  };

  const handleCustomerDeleted = (deletedId) => {
    setBanner({ type: 'success', title: 'Customer Deleted', message: 'Customer account and ledger records deleted.' });
    fetchCustomers();
  };

  const handleTxRecorded = (newTx, updatedCustomer) => {
    setBanner({ type: 'success', title: 'Transaction Saved', message: `Ledger entry of Rs. ${newTx.amount.toLocaleString()} recorded.` });
    if (selectedCustomer) {
      fetchCustomerTransactions(selectedCustomer._id);
      fetchCustomers(selectedCustomer._id);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!confirm('Are you sure you want to delete this transaction entry?')) return;
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: 'success', title: 'Entry Deleted', message: 'Transaction was deleted and customer balance restored.' });
        if (selectedCustomer) {
          fetchCustomerTransactions(selectedCustomer._id);
          fetchCustomers(selectedCustomer._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner Message */}
      {banner && (
        <SuccessBanner
          title={banner.title}
          message={banner.message}
          onDismiss={() => setBanner(null)}
        />
      )}

      {/* Header Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            Customer Management & Udhar Ledger
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Full CRUD operations, credit limits, real-time running balances, and WhatsApp dues reminders.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddCustomerOpen(true)} icon={Plus}>
          Add New Customer
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search by customer name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'receivable', 'payable', 'settled'].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBalanceFilter(b)}
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  border: balanceFilter === b ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: balanceFilter === b ? 'rgba(59, 130, 246, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: balanceFilter === b ? '#60a5fa' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {b === 'all' && 'All Customers'}
                {b === 'receivable' && '🟢 You Will Get'}
                {b === 'payable' && '🔴 You Give (Advance)'}
                {b === 'settled' && 'Settled (Rs. 0)'}
              </button>
            ))}
          </div>

          <Button variant="secondary" size="sm" type="submit" icon={Search}>
            Search
          </Button>
        </form>
      </Card>

      {/* Main Workspace (Two-Column Master-Detail) */}
      <div className="responsive-workspace-grid">
        {/* Left Column: Customer Directory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Customer Accounts ({customers.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select to view ledger</span>
          </div>

          {loading ? (
            <LoadingState message="Loading customers..." />
          ) : customers.length === 0 ? (
            <EmptyState
              title="No Customers Found"
              message="No customer accounts match your active filters."
              actionText="Add Customer"
              onAction={() => setIsAddCustomerOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {customers.map((c) => {
                const isSelected = selectedCustomer?._id === c._id;
                const isReceivable = c.netBalance > 0;
                const isPayable = c.netBalance < 0;

                return (
                  <div
                    key={c._id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      fetchCustomerTransactions(c._id);
                    }}
                    className={`glass-card ${isSelected ? '' : 'glass-card-interactive'}`}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid #3b82f6' : isReceivable ? '4px solid #10b981' : isPayable ? '4px solid #ef4444' : '4px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.65)',
                      borderColor: isSelected ? '#3b82f6' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'white' }}>{c.name}</strong>
                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: isReceivable ? '#34d399' : isPayable ? '#f87171' : '#94a3b8'
                      }}>
                        Rs. {Math.abs(c.netBalance).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Phone size={13} color="#64748b" /> {c.phone}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: isReceivable ? 'rgba(16, 185, 129, 0.15)' : isPayable ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: isReceivable ? '#34d399' : isPayable ? '#f87171' : '#94a3b8',
                        fontWeight: 600
                      }}>
                        {isReceivable ? 'You Will Get' : isPayable ? 'You Give' : 'Settled'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <MapPin size={12} /> {c.city} • <span style={{ color: '#60a5fa' }}>{c.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Customer Profile & Ledger */}
        <div>
          {selectedCustomer ? (
            <Card>
              {/* Customer Profile Banner Header */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{selectedCustomer.name}</h2>
                      <Badge variant="blue">{selectedCustomer.category}</Badge>
                      <Badge variant={selectedCustomer.status === 'active' ? 'green' : 'red'}>
                        {selectedCustomer.status}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} color="#38bdf8" /> {selectedCustomer.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#38bdf8" /> {selectedCustomer.address || selectedCustomer.city}
                      </span>
                    </div>
                  </div>

                  {/* Customer Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="sm" onClick={() => setIsWhatsAppOpen(true)} icon={MessageSquare}>
                      WhatsApp Reminder
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsStatementOpen(true)} icon={FileText}>
                      Statement
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditCustomerOpen(true)} icon={Edit2}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setIsDeleteCustomerOpen(true)} icon={Trash2}>
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Net Balance & Credit Limit Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Net Balance:</span>
                    <strong style={{ fontSize: '1.2rem', color: selectedCustomer.netBalance > 0 ? '#34d399' : selectedCustomer.netBalance < 0 ? '#f87171' : '#94a3b8' }}>
                      Rs. {Math.abs(selectedCustomer.netBalance).toLocaleString()}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                      {selectedCustomer.netBalance > 0 ? '(You Will Get)' : selectedCustomer.netBalance < 0 ? '(Advance)' : '(Settled)'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Credit Limit:</span>
                    <strong style={{ fontSize: '1.1rem', color: 'white' }}>
                      Rs. {(selectedCustomer.creditLimit || 0).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Credit Terms:</span>
                    <strong style={{ fontSize: '1rem', color: '#38bdf8' }}>
                      {selectedCustomer.paymentTermsDays || 15} Days
                    </strong>
                  </div>
                </div>
              </div>

              {/* Transaction Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                  Transaction Ledger History ({transactions.length} entries)
                </h3>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setTxDefaultType('GAVE_CREDIT');
                      setIsAddTxOpen(true);
                    }}
                    icon={ArrowUpRight}
                  >
                    🔴 You Gave (Udhar)
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setTxDefaultType('GOT_PAYMENT');
                      setIsAddTxOpen(true);
                    }}
                    icon={ArrowDownLeft}
                  >
                    🟢 You Got (Wasooli)
                  </Button>
                </div>
              </div>

              {/* Ledger Transactions Table */}
              {txLoading ? (
                <LoadingState message="Loading ledger entries..." />
              ) : transactions.length === 0 ? (
                <EmptyState
                  title="No Ledger Transactions Yet"
                  message="Record a credit or payment entry to start this customer's digital ledger."
                  actionText="Record First Entry"
                  onAction={() => {
                    setTxDefaultType('GAVE_CREDIT');
                    setIsAddTxOpen(true);
                  }}
                />
              ) : (
                <div className="horizontal-scroll-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', minWidth: '580px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#090d16', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', textAlign: 'left' }}>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Date</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Type</th>
                        <th style={{ padding: '0.65rem 0.85rem' }}>Bill/Invoice #</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount (PKR)</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Running Balance</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isCredit = tx.type === 'GAVE_CREDIT';
                        return (
                          <tr key={tx._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1' }}>
                              {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem' }}>
                              <span style={{
                                padding: '0.2rem 0.55rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                background: isCredit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isCredit ? '#f87171' : '#34d399'
                              }}>
                                {isCredit ? '🔴 GAVE (Udhar)' : '🟢 GOT (Wasooli)'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                              {tx.billNumber || '-'}
                              {tx.description && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.description}</div>}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: isCredit ? '#f87171' : '#34d399' }}>
                              Rs. {Number(tx.amount).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#38bdf8' }}>
                              Rs. {Number(tx.balanceAfter).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                <button
                                  onClick={() => {
                                    setSelectedTx(tx);
                                    setIsEditTxOpen(true);
                                  }}
                                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
                                  title="Edit entry"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTransaction(tx._id)}
                                  style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.2rem' }}
                                  title="Delete entry"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          ) : (
            <EmptyState
              title="No Customer Selected"
              message="Select a customer from the left directory or register a new customer."
              actionText="Register Customer"
              onAction={() => setIsAddCustomerOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals Mounting */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={handleCustomerCreated}
      />

      <EditCustomerModal
        isOpen={isEditCustomerOpen}
        onClose={() => setIsEditCustomerOpen(false)}
        customer={selectedCustomer}
        onSuccess={handleCustomerUpdated}
      />

      <DeleteCustomerModal
        isOpen={isDeleteCustomerOpen}
        onClose={() => setIsDeleteCustomerOpen(false)}
        customer={selectedCustomer}
        onSuccess={handleCustomerDeleted}
      />

      <AddCustomerTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        customer={selectedCustomer}
        defaultType={txDefaultType}
        onSuccess={handleTxRecorded}
      />

      <EditTransactionModal
        isOpen={isEditTxOpen}
        onClose={() => setIsEditTxOpen(false)}
        transaction={selectedTx}
        onSuccess={() => {
          if (selectedCustomer) {
            fetchCustomerTransactions(selectedCustomer._id);
            fetchCustomers(selectedCustomer._id);
          }
        }}
      />

      <WhatsAppReminderModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        party={selectedCustomer}
        partyType="Customer"
      />

      <StatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        party={selectedCustomer}
        partyType="Customer"
        entries={transactions}
      />
    </div>
  );
}
