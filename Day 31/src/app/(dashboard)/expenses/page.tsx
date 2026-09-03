"use client";

import React, { useState, useEffect } from "react";
import { ExpenseModal, ExpenseItem, ExpenseFormData } from "../../../components/ExpenseModal";
import { Plus, Pencil, Trash2, Receipt, AlertCircle, Loader2 } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hisabdo_expenses");
      if (saved) {
        setExpenses(JSON.parse(saved));
      }
    } catch (err) {
      setError("Failed to load saved expenses. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveExpensesToStorage = (updated: ExpenseItem[]) => {
    setExpenses(updated);
    localStorage.setItem("hisabdo_expenses", JSON.stringify(updated));
  };

  const handleCreateOrUpdate = (data: ExpenseFormData) => {
    if (editingExpense) {
      const updated = expenses.map((item) =>
        item.id === editingExpense.id ? { ...data, id: editingExpense.id } : item
      );
      saveExpensesToStorage(updated);
    } else {
      const newItem: ExpenseItem = {
        ...data,
        id: Date.now().toString(),
      };
      saveExpensesToStorage([newItem, ...expenses]);
    }
    setEditingExpense(null);
  };

  const handleEdit = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense record?")) {
      const updated = expenses.filter((item) => item.id !== id);
      saveExpensesToStorage(updated);
    }
  };

  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Expenses Tracker</h1>
          <p className="text-slate-400 text-sm">Manage operational costs and business outflow</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Expenses Logged</p>
            <h2 className="text-2xl font-bold text-white">Rs. {totalExpenses.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading expense records...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-6 bg-rose-950/20 border border-rose-900/50 rounded-xl flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && expenses.length === 0 && (
        <div className="p-12 text-center bg-slate-900/30 border border-slate-800 border-dashed rounded-xl">
          <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No Expenses Recorded</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            You haven't added any expense entries yet. Click below to add your first record.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        </div>
      )}

      {/* Data Table View */}
      {!isLoading && !error && expenses.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {expenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{item.date}</td>
                    <td className="px-6 py-4 font-semibold text-rose-400">
                      Rs. {Number(item.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                        title="Edit Expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Integration */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingExpense}
      />
    </div>
  );
}