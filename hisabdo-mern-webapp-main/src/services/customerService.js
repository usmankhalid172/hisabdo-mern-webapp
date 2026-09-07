import apiClient from '@/lib/axios';
export const customerService = {
  getAll: async () => {
    const response = await apiClient.get('/customers');
    return response.data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },
  create: async (customerData) => {
    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },
  update: async (id, customerData) => {
    const response = await apiClient.put(`/customers/${id}`, customerData);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
