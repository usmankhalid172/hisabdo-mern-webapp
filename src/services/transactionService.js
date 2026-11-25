import apiClient from '@/lib/axios';
import {
  convertFromPKR,
  convertToPKR,
  getUserCurrency,
} from '@/services/currencyService';

async function convertTransactionFromPKR(tx, targetCurrency) {
  if (!tx || targetCurrency === 'PKR') return tx;
  return {
    ...tx,
    amount: await convertFromPKR(tx.amount, targetCurrency),
  };
}

export const transactionService = {
  getAll: async (params) => {
    const response = await apiClient.get('/transactions', { params });
    const data = response.data;
    const targetCurrency = getUserCurrency();
    if (!data || targetCurrency === 'PKR') return data;

    if (Array.isArray(data)) {
      return Promise.all(data.map((tx) => convertTransactionFromPKR(tx, targetCurrency)));
    }
    if (Array.isArray(data.transactions)) {
      return {
        ...data,
        transactions: await Promise.all(
          data.transactions.map((tx) => convertTransactionFromPKR(tx, targetCurrency))
        ),
      };
    }
    return data;
  },

  create: async (transactionData) => {
    const selectedCurrency = getUserCurrency();
    const payload =
      transactionData && transactionData.amount !== undefined
        ? {
            ...transactionData,
            amount: await convertToPKR(transactionData.amount, selectedCurrency),
          }
        : transactionData;
    const response = await apiClient.post('/transactions', payload);
    const data = response.data;
    if (selectedCurrency === 'PKR' || !data) return data;
    if (data.transaction) {
      return {
        ...data,
        transaction: await convertTransactionFromPKR(data.transaction, selectedCurrency),
      };
    }
    return data;
  },

  update: async (id, transactionData) => {
    const selectedCurrency = getUserCurrency();
    const payload =
      transactionData && transactionData.amount !== undefined
        ? {
            ...transactionData,
            amount: await convertToPKR(transactionData.amount, selectedCurrency),
          }
        : transactionData;
    const response = await apiClient.put(`/transactions/${id}`, payload);
    const data = response.data;
    if (selectedCurrency === 'PKR' || !data) return data;
    if (data.transaction) {
      return {
        ...data,
        transaction: await convertTransactionFromPKR(data.transaction, selectedCurrency),
      };
    }
    return data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },
};
