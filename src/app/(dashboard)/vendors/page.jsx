'use client';

import React, { useState, useEffect } from 'react';
import {
  Truck, Search, Plus, Phone, MapPin, Building2, CreditCard,
  ArrowUpRight, ArrowDownLeft, Edit2, Trash2, MessageSquare,
  FileText, Calendar, DollarSign
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import { LoadingState, EmptyState, SuccessBanner } from '../../../components/ui/StateAlert';
import AddVendorModal from '../../../components/vendors/AddVendorModal';
import EditVendorModal from '../../../components/vendors/EditVendorModal';
import DeleteVendorModal from '../../../components/vendors/DeleteVendorModal';
import AddVendorTransactionModal from '../../../components/transactions/AddVendorTransactionModal';
import EditTransactionModal from '../../../components/transactions/EditTransactionModal';
import WhatsAppReminderModal from '../../../components/statements/WhatsAppReminderModal';
import StatementModal from '../../../components/statements/StatementModal';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [banner, setBanner] = useState(null);

  // Modals state
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [isDeleteVendorOpen, setIsDeleteVendorOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState('PURCHASE_BILL');
  const [isEditTxOpen, setIsEditTxOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);

  const fetchVendors = async (selectedIdToKeep) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/vendors?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setVendors(data.data);
        if (data.data.length > 0) {
          const target = selectedIdToKeep
            ? data.data.find(v => v._id === selectedIdToKeep) || data.data[0]
            : (selectedVendor ? data.data.find(v => v._id === selectedVendor._id) || data.data[0] : data.data[0]);
          setSelectedVendor(target);
          if (target) {
            fetchVendorTransactions(target._id);
          }
        } else {
          setSelectedVendor(null);
          setTransactions([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorTransactions = async (vendorId) => {
    try {
      setTxLoading(true);
      const res = await fetch(`/api/vendors/${vendorId}/transactions`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
        if (data.vendor) {
          setSelectedVendor(prev => prev ? { ...prev, ...data.vendor } : data.vendor);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [categoryFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVendors();
  };

  const handleVendorCreated = (newVend) => {
    setBanner({ type: 'success', title: 'Supplier Registered', message: `${newVend.companyName} (${newVend.name}) registered successfully.` });
    fetchVendors(newVend._id);
  };

  const handleVendorUpdated = (updatedVend) => {
    setBanner({ type: 'success', title: 'Supplier Profile Updated', message: `${updatedVend.companyName} profile was successfully updated.` });
    fetchVendors(updatedVend._id);
  };

  const handleVendorDeleted = (deletedId) => {
    setBanner({ type: 'success', title: 'Supplier Deleted', message: 'Supplier profile and purchase records deleted.' });
    fetchVendors();
  };

  const handleTxRecorded = (newTx, updatedVendor) => {
    setBanner({ type: 'success', title: 'Transaction Recorded', message: `Supplier ledger entry of Rs. ${newTx.amount.toLocaleString()} saved.` });
    if (selectedVendor) {
      fetchVendorTransactions(selectedVendor._id);
      fetchVendors(selectedVendor._id);
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!confirm('Are you sure you want to delete this supplier transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: 'success', title: 'Transaction Deleted', message: 'Supplier entry deleted and payable balance restored.' });
        if (selectedVendor) {
          fetchVendorTransactions(selectedVendor._id);
          fetchVendors(selectedVendor._id);
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
            Vendor / Supplier Management & Bills Payable
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Track raw material purchases, purchase bills, bank payment vouchers, and vendor balances.
          </p>
        </div>

        <Button variant="amber" size="md" onClick={() => setIsAddVendorOpen(true)} icon={Plus}>
          Add New Supplier
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <Input
              placeholder="Search by company name, proprietor, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              style={{ marginBottom: 0 }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'payable', 'paid', 'advance'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  border: statusFilter === s ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                  background: statusFilter === s ? 'rgba(245, 158, 11, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                  color: statusFilter === s ? '#fbbf24' : '#94a3b8',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {s === 'all' && 'All Suppliers'}
                {s === 'payable' && '⚠️ You Owe (Payable)'}
                {s === 'paid' && 'Settled (Rs. 0)'}
                {s === 'advance' && '🟢 Advance Paid'}
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
        {/* Left Column: Supplier Directory */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Supplier Directory ({vendors.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Select to view purchase ledger</span>
          </div>

          {loading ? (
            <LoadingState message="Loading suppliers..." />
          ) : vendors.length === 0 ? (
            <EmptyState
              title="No Suppliers Found"
              message="No vendor accounts match your filter criteria."
              actionText="Add Supplier"
              onAction={() => setIsAddVendorOpen(true)}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '720px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {vendors.map((v) => {
                const isSelected = selectedVendor?._id === v._id;
                const isPayable = v.payableBalance > 0;
                const isAdvance = v.payableBalance < 0;

                return (
                  <div
                    key={v._id}
                    onClick={() => {
                      setSelectedVendor(v);
                      fetchVendorTransactions(v._id);
                    }}
                    className={`glass-card ${isSelected ? '' : 'glass-card-interactive'}`}
                    style={{
                      padding: '1rem',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '4px solid #f59e0b' : isPayable ? '4px solid #f59e0b' : isAdvance ? '4px solid #10b981' : '4px solid rgba(255, 255, 255, 0.1)',
                      background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.65)',
                      borderColor: isSelected ? '#f59e0b' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'white' }}>{v.companyName}</strong>
                      <span style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: isPayable ? '#fbbf24' : isAdvance ? '#34d399' : '#94a3b8'
                      }}>
                        Rs. {Math.abs(v.payableBalance).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Building2 size={13} color="#64748b" /> {v.name}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: isPayable ? 'rgba(245, 158, 11, 0.15)' : isAdvance ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                        color: isPayable ? '#fbbf24' : isAdvance ? '#34d399' : '#94a3b8',
                        fontWeight: 600
                      }}>
                        {isPayable ? 'You Owe (Payable)' : isAdvance ? 'Advance Paid' : 'Settled'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <MapPin size={12} /> {v.city} • <span style={{ color: '#fbbf24' }}>{v.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Vendor Profile & Ledger */}
        <div>
          {selectedVendor ? (
            <Card>
              {/* Vendor Profile Header */}
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white' }}>{selectedVendor.companyName}</h2>
                      <Badge variant="amber">{selectedVendor.category}</Badge>
                      <Badge variant={selectedVendor.status === 'active' ? 'green' : 'red'}>
                        {selectedVendor.status}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Building2 size={14} color="#f59e0b" /> Contact: {selectedVendor.name}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Phone size={14} color="#f59e0b" /> {selectedVendor.phone}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} color="#f59e0b" /> {selectedVendor.city}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button variant="secondary" size="sm" onClick={() => setIsWhatsAppOpen(true)} icon={MessageSquare}>
                      WhatsApp Voucher
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsStatementOpen(true)} icon={FileText}>
                      Statement
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsEditVendorOpen(true)} icon={Edit2}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setIsDeleteVendorOpen(true)} icon={Trash2}>
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Payable Balance & Bank Details Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginTop: '1.25rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem 1rem', borderRadius: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Dues to Supplier:</span>
                    <strong style={{ fontSize: '1.2rem', color: selectedVendor.payableBalance > 0 ? '#fbbf24' : selectedVendor.payableBalance < 0 ? '#34d399' : '#94a3b8' }}>
                      Rs. {Math.abs(selectedVendor.payableBalance).toLocaleString()}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.35rem' }}>
                      {selectedVendor.payableBalance > 0 ? '(You Owe Supplier)' : selectedVendor.payableBalance < 0 ? '(Advance Paid)' : '(Settled)'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Supplier Bank Details:</span>
                    <strong style={{ fontSize: '0.9rem', color: 'white', display: 'block' }}>
                      {selectedVendor.bankName || 'Meezan Bank'}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                      {selectedVendor.accountNumber || 'Account Title: ' + selectedVendor.companyName}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Credit Terms:</span>
                    <strong style={{ fontSize: '1rem', color: '#f59e0b' }}>
                      {selectedVendor.paymentTermsDays || 30} Days
                    </strong>
                  </div>
                </div>
              </div>

              {/* Transaction Action Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white' }}>
                  Supplier Purchase Bills & Payments ({transactions.length} entries)
                </h3>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => {
                      setTxDefaultType('PURCHASE_BILL');
                      setIsAddTxOpen(true);
                    }}
                    icon={ArrowUpRight}
                  >
                    📦 Add Purchase Bill (Payable +)
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      setTxDefaultType('PAID_PAYMENT');
                      setIsAddTxOpen(true);
                    }}
                    icon={ArrowDownLeft}
                  >
                    💸 Paid to Supplier (Adaigi -)
                  </Button>
                </div>
              </div>

              {/* Transactions Table */}
              {txLoading ? (
                <LoadingState message="Loading supplier ledger entries..." />
              ) : transactions.length === 0 ? (
                <EmptyState
                  title="No Supplier Bills or Payments Yet"
                  message="Add a purchase invoice bill or record a payment to maintain this supplier's ledger."
                  actionText="Add Purchase Bill"
                  onAction={() => {
                    setTxDefaultType('PURCHASE_BILL');
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
                        <th style={{ padding: '0.65rem 0.85rem' }}>Bill/Voucher #</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Amount (PKR)</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Running Payable</th>
                        <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const isPurchase = tx.type === 'PURCHASE_BILL';
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
                                background: isPurchase ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isPurchase ? '#fbbf24' : '#34d399'
                              }}>
                                {isPurchase ? '📦 PURCHASE BILL' : '💸 PAID PAYMENT'}
                              </span>
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                              {tx.billNumber || '-'}
                              {tx.description && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.description}</div>}
                            </td>
                            <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, color: isPurchase ? '#fbbf24' : '#34d399' }}>
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
              title="No Supplier Selected"
              message="Select a supplier from the left directory or register a new vendor profile."
              actionText="Register Supplier"
              onAction={() => setIsAddVendorOpen(true)}
            />
          )}
        </div>
      </div>

      {/* Modals Mounting */}
      <AddVendorModal
        isOpen={isAddVendorOpen}
        onClose={() => setIsAddVendorOpen(false)}
        onSuccess={handleVendorCreated}
      />

      <EditVendorModal
        isOpen={isEditVendorOpen}
        onClose={() => setIsEditVendorOpen(false)}
        vendor={selectedVendor}
        onSuccess={handleVendorUpdated}
      />

      <DeleteVendorModal
        isOpen={isDeleteVendorOpen}
        onClose={() => setIsDeleteVendorOpen(false)}
        vendor={selectedVendor}
        onSuccess={handleVendorDeleted}
      />

      <AddVendorTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        vendor={selectedVendor}
        defaultType={txDefaultType}
        onSuccess={handleTxRecorded}
      />

      <EditTransactionModal
        isOpen={isEditTxOpen}
        onClose={() => setIsEditTxOpen(false)}
        transaction={selectedTx}
        onSuccess={() => {
          if (selectedVendor) {
            fetchVendorTransactions(selectedVendor._id);
            fetchVendors(selectedVendor._id);
          }
        }}
      />

      <WhatsAppReminderModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        party={selectedVendor}
        partyType="Vendor"
      />

      <StatementModal
        isOpen={isStatementOpen}
        onClose={() => setIsStatementOpen(false)}
        party={selectedVendor}
        partyType="Vendor"
        entries={transactions}
      />
    </div>
  );
}
