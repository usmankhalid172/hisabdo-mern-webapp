
import apiClient from '@/lib/axios';

export const customerService = {
  getAll: async () => {
    const response = await apiClient.get('/customers');
    console.log('Fetched customers:', response.data);
    return response.data;
  },

  getById: async (id) => {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('Valid customer ID is required');
    }

    const response = await apiClient.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customerData) => {
    console.log('Creating customer with data:', customerData);
    if (!customerData || typeof customerData !== 'object') {
      throw new Error('Customer data is required');
    }

    if (!customerData.name?.trim()) {
      throw new Error('Customer name is required');
    }

    if (
      customerData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    ) {
      throw new Error('Invalid email format');
    }

    if (
      customerData.phone &&
      !/^\+?[\d\s()-]{7,20}$/.test(customerData.phone)
    ) {
      throw new Error('Invalid phone number');
    }

    const response = await apiClient.post('/customers', customerData);
    return response.data;
  },

  update: async (id, customerData) => {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('Valid customer ID is required');
    }

    if (!customerData || typeof customerData !== 'object') {
      throw new Error('Customer data is required');
    }

    if (
      customerData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)
    ) {
      throw new Error('Invalid email format');
    }

    if (
      customerData.phone &&
      !/^\+?[\d\s()-]{7,20}$/.test(customerData.phone)
    ) {
      throw new Error('Invalid phone number');
    }

    const response = await apiClient.put(
      `/customers/${id}`,
      customerData
    );
    return response.data;
  },

  delete: async (id) => {
    if (!id || typeof id !== 'string' || !id.trim()) {
      throw new Error('Valid customer ID is required');
    }

    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
