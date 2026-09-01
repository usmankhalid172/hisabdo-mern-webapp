import apiClient from '@/lib/axios';

export const transactionService = {
  getAll: async (params) => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  create: async (transactionData) => {
    const response = await apiClient.post('/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const response = await apiClient.put(
      `/transactions/${id}`,
      transactionData
    );
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },
};
