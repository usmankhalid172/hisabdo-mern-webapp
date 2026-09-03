"use client";

import React, { useState, useEffect } from "react";
import { CustomerModal, CustomerItem, CustomerFormData } from "../../../components/CustomerModal";
import { Plus, Pencil, Trash2, Users, AlertCircle, Loader2, Phone, ShieldCheck } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("hisabdo_customers");
      if (saved) {
        setCustomers(JSON.parse(saved));
      }
    } catch (err) {
      setError("Failed to load saved party contacts. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCustomersToStorage = (updated: CustomerItem[]) => {
    setCustomers(updated);
    localStorage.setItem("hisabdo_customers", JSON.stringify(updated));
  };

  const handleCreateOrUpdate = (data: CustomerFormData) => {
    if (editingCustomer) {
      const updated = customers.map((item) =>
        item.id === editingCustomer.id ? { ...data, id: editingCustomer.id } : item
      );
      saveCustomersToStorage(updated);
    } else {
      const newItem: CustomerItem = {
        ...data,
        id: Date.now().toString(),
      };
      saveCustomersToStorage([newItem, ...customers]);
    }
    setEditingCustomer(null);
  };

  const handleEdit = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this customer entry?")) {
      const updated = customers.filter((item) => item.id !== id);
      saveCustomersToStorage(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Auth Prepared Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Customers & Parties</h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Auth-Protected Route
            </span>
          </div>
          <p className="text-slate-400 text-sm">Manage business contacts, suppliers, and customer ledgers</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Party Contact
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">Total Parties Registered</p>
            <h2 className="text-2xl font-bold text-white">{customers.length}</h2>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
          <p className="text-slate-400 text-sm">Loading party contacts...</p>
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
      {!isLoading && !error && customers.length === 0 && (
        <div className="p-12 text-center bg-slate-900/30 border border-slate-800 border-dashed rounded-xl">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No Customers/Parties Added</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Your contact list is empty. Add a customer or supplier to start logging transactions under their account.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Party Contact
          </button>
        </div>
      )}

      {/* Table View */}
      {!isLoading && !error && customers.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Opening Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {customers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {item.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          item.type === "Customer"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      Rs. {Number(item.openingBalance).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition"
                        title="Edit Contact"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete Contact"
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
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingCustomer}
      />
    </div>
  );
}