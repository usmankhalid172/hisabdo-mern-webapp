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
    let token = null;
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("hisabdo_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");
    }
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await apiClient.delete(`/transactions/${id}`, { headers });
    return response.data;
  },

  bulkDelete: async (ids) => {
    let token = null;
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("hisabdo_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");
    }
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await apiClient.delete('/transactions', {
      data: { ids },
      headers,
    });
    return response.data;
  },
};
