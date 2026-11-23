'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { hisabDoService } from '@/services/hisabdoService';
import { AddIncomeForm, AddExpenseForm } from '@/components/transactions';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DataTable } from '@/components/ui/DataTable';
import { SuccessBanner } from '@/components/ui/StateAlert';

export default function CashbookPage() {
  const { user } = useAuth();
  const { formatMoney } = useSettings();

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const totalIn = entries.filter(e => e.type === 'in').reduce((s, e) => s + e.amount, 0);
  const totalOut = entries.filter(e => e.type === 'out').reduce((s, e) => s + e.amount, 0);
  const netCash = totalIn - totalOut;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const userId = user?.id || 'guest';

      const [incomes, expenses] = await Promise.all([
        hisabDoService.getIncomes(userId),
        hisabDoService.getExpenses(userId),
      ]);

      const incomeEntries = incomes.map((item) => ({
        id: item.id,
        type: 'in',
        amount: Number(item.amount) || 0,
        category: item.category_id || 'Income',
        description: item.description || 'Cash In',
        date: item.income_date,
      }));

      const expenseEntries = expenses.map((item) => ({
        id: item.id,
        type: 'out',
        amount: Number(item.amount) || 0,
        category: item.category_id || 'Expense',
        description: item.description || 'Cash Out',
        date: item.expense_date,
      }));

      const allEntries = [...incomeEntries, ...expenseEntries];

      allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

      setEntries(allEntries);
    } catch (err) {
      console.error('Cashbook loading error:', err);
      setError('Unable to load cashbook records.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIncomeSuccess = async () => {
    setShowIncomeForm(false);
    setSuccessMsg('Income recorded successfully.');
    await loadData();
  };

  const handleExpenseSuccess = async () => {
    setShowExpenseForm(false);
    setSuccessMsg('Expense recorded successfully.');
    await loadData();
  };

  const handleAddIncome = async (payload) => {
    await hisabDoService.addIncome(user?.id || 'guest', {
      amount: payload.amount,
      customer_id: payload.customerId || null,
      category_id: payload.category,
      income_date: payload.date,
      description: payload.description,
      payment_method: payload.paymentMethod,
    });
  };

  const handleAddExpense = async (payload) => {
    await hisabDoService.addExpense(user?.id || 'guest', {
      amount: payload.amount,
      customer_id: payload.customerId || null,
      category_id: payload.category,
      expense_date: payload.date,
      description: payload.description,
      payment_method: payload.paymentMethod,
    });
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Badge variant="blue" style={{ marginBottom: '0.4rem' }}>Module 1: Cash Management</Badge>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'white' }}>Digital Cashbook</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>Track cash flow, daily receipts, shop expenses, and closing balance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="success" onClick={() => setShowIncomeForm(true)}>
            <PlusCircle size={16} />
            Cash In
          </Button>

          <Button variant="danger" onClick={() => setShowExpenseForm(true)}>
            <MinusCircle size={16} />
            Cash Out
          </Button>
        </div>
      </div>

      <SuccessBanner message={successMsg} onDismiss={() => setSuccessMsg('')} />
      <AddIncomeForm
        isOpen={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        onSubmitCustom={handleAddIncome}
        onSuccess={handleIncomeSuccess}
      />

      <AddExpenseForm
        isOpen={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        onSubmitCustom={handleAddExpense}
        onSuccess={handleExpenseSuccess}
      />

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

            {/* CASH TRANSACTIONS REGISTER */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold text-foreground">
            Cash Transactions Register
          </h2>
          <p className="text-sm text-muted-foreground">
            History of recorded income and expenses
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading cashbook records...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-danger">
            {error}
            <Button variant="secondary" onClick={loadData}>
              Retry
            </Button>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'date',
                header: 'Date',
                sortable: true,
              },
              {
                key: 'type',
                header: 'Type',
                render: (entry) => (
                  <Badge variant={entry.type === 'in' ? 'green' : 'red'}>
                    {entry.type === 'in' ? 'Cash In' : 'Cash Out'}
                  </Badge>
                ),
              },
              {
                key: 'category',
                header: 'Category',
              },
              {
                key: 'description',
                header: 'Remarks',
              },
              {
                key: 'amount',
                header: 'Amount (PKR)',
                align: 'right',
                render: (entry) => (
                  <span className={entry.type === 'in' ? 'text-success' : 'text-danger'}>
                    {entry.type === 'in' ? '+' : '-'} {formatMoney(entry.amount)}
                  </span>
                ),
              },
            ]}
            data={entries}
            rowKey={(entry) => `${entry.type}-${entry.id}`}
            emptyTitle="No cash transactions yet"
            emptyMessage="Your income and expense records will appear here."
          />
        )}
      </Card>
    </div>
  );
}
