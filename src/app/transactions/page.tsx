"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import {
  TransactionModal,
  TransactionFormData,
  TransactionItem,
} from "@/components/TransactionModal";
import { transactionService } from "@/services/transactionService";

interface ApiTransaction {
  _id: string;
  user: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}
export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "income" | "expense"
  >("all");
  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await transactionService.getAll();

      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);
  const handleCreateOrUpdate = async (data: TransactionFormData) => {
    try {
      setError("");
      const apiData = {
        type: data.type === "Got Money" ? "income" : "expense",
        amount: data.amount,
        description: data.partyName,
        date: data.date,
      };
      if (editingTransaction) {
        await transactionService.update(
          editingTransaction.id,
          apiData
        );
      } else {
        await transactionService.create(apiData);
      }
      setEditingTransaction(null);
      setIsModalOpen(false);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      setError("Failed to save transaction. Please try again.");
    }
  };
  const handleEdit = (transaction: ApiTransaction) => {
    const modalData: TransactionItem = {
      id: transaction._id,
      partyName: transaction.description,
      amount: transaction.amount,
      type:
        transaction.type === "income"
          ? "Got Money"
          : "Gave Money",
      date: transaction.date.split("T")[0],
    };
    setEditingTransaction(modalData);
    setIsModalOpen(true);
  };
  const handleDelete = async (id: string) => {
    const confirmed = confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await transactionService.delete(id);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      setError("Failed to delete transaction. Please try again.");
    }
  };
  const filteredTransactions = transactions.filter(
    (transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        transaction.type === typeFilter;

      return matchesSearch && matchesType;
    }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Khata / Transactions
          </h1>
          <p className="text-slate-400 text-sm">
            Manage your income and expense transactions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTransaction(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>
      {error && (
        <div className="bg-rose-950/30 border border-rose-900 text-rose-400 p-4 rounded-lg">
          {error}
        </div>
      )}
      {!loading && transactions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by party/customer name..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as "all" | "income" | "expense"
                )
              }
              className="bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Transactions</option>
              <option value="income">Got Money</option>
              <option value="expense">Gave Money</option>
            </select>

          </div>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="text-lg font-semibold text-slate-300">
            No Transactions
          </h3>

          <p className="text-slate-500 text-sm mt-1">
            Add your first transaction to your Khata.
          </p>
        </div>

      ) : filteredTransactions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />

          <h3 className="text-lg font-semibold text-slate-300">
            No Transactions Found
          </h3>

          <p className="text-slate-500 text-sm mt-1">
            Try changing your search or filter.
          </p>
        </div>

      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">

            <table className="w-full text-left text-sm">

              <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Party</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/50">

                {filteredTransactions.map((transaction) => (

                  <tr
                    key={transaction._id}
                    className="hover:bg-slate-800/30"
                  >

                    <td className="px-6 py-4 font-medium text-white">
                      {transaction.description}
                    </td>

                    <td className="px-6 py-4">
                      {transaction.type === "income" ? (
                        <span className="text-emerald-400">
                          Got Money
                        </span>
                      ) : (
                        <span className="text-rose-400">
                          Gave Money
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {transaction.date.split("T")[0]}
                    </td>

                    <td className="px-6 py-4 font-semibold text-white">
                      Rs. {transaction.amount.toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right space-x-2">

                      <button
                        onClick={() => handleEdit(transaction)}
                        className="p-2 text-slate-400 hover:text-emerald-400"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(transaction._id)
                        }
                        className="p-2 text-slate-400 hover:text-rose-400"
                        title="Delete"
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
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingTransaction}
      />

    </div>
  );
}