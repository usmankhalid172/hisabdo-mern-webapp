import apiClient from '@/lib/axios';
import {
  convertFromPKR,
  convertToPKR,
  getUserCurrency,
} from '@/services/currencyService';

async function convertCustomerFromPKR(customer, targetCurrency) {
  if (!customer || targetCurrency === 'PKR') return customer;
  return {
    ...customer,
    ...(customer.opening_balance !== undefined
      ? { opening_balance: await convertFromPKR(customer.opening_balance, targetCurrency) }
      : {}),
    ...(customer.initialBalance !== undefined
      ? { initialBalance: await convertFromPKR(customer.initialBalance, targetCurrency) }
      : {}),
    ...(customer.netBalance !== undefined
      ? { netBalance: await convertFromPKR(customer.netBalance, targetCurrency) }
      : {}),
    ...(customer.creditLimit !== undefined
      ? { creditLimit: await convertFromPKR(customer.creditLimit, targetCurrency) }
      : {}),
  };
}

export const customerService = {
  getAll: async () => {
    const response = await apiClient.get('/customers');
    const data = response.data;
    const targetCurrency = getUserCurrency();
    if (!data || targetCurrency === 'PKR') return data;

    if (Array.isArray(data)) {
      return Promise.all(data.map((c) => convertCustomerFromPKR(c, targetCurrency)));
    }
    if (Array.isArray(data.customers)) {
      return {
        ...data,
        customers: await Promise.all(
          data.customers.map((c) => convertCustomerFromPKR(c, targetCurrency))
        ),
      };
    }
    return data;
  },
  getById: async (id) => {
    const response = await apiClient.get(`/customers/${id}`);
    const data = response.data;
    const targetCurrency = getUserCurrency();
    if (!data || targetCurrency === 'PKR') return data;
    if (data.customer) {
      return {
        ...data,
        customer: await convertCustomerFromPKR(data.customer, targetCurrency),
      };
    }
    return convertCustomerFromPKR(data, targetCurrency);
  },
  create: async (customerData) => {
    const selectedCurrency = getUserCurrency();
    const payload = { ...customerData };
    if (payload.opening_balance !== undefined) {
      payload.opening_balance = await convertToPKR(payload.opening_balance, selectedCurrency);
    }
    if (payload.initialBalance !== undefined) {
      payload.initialBalance = await convertToPKR(payload.initialBalance, selectedCurrency);
    }
    if (payload.creditLimit !== undefined) {
      payload.creditLimit = await convertToPKR(payload.creditLimit, selectedCurrency);
    }
    const response = await apiClient.post('/customers', payload);
    return response.data;
  },
  update: async (id, customerData) => {
    const selectedCurrency = getUserCurrency();
    const payload = { ...customerData };
    if (payload.opening_balance !== undefined) {
      payload.opening_balance = await convertToPKR(payload.opening_balance, selectedCurrency);
    }
    if (payload.initialBalance !== undefined) {
      payload.initialBalance = await convertToPKR(payload.initialBalance, selectedCurrency);
    }
    if (payload.creditLimit !== undefined) {
      payload.creditLimit = await convertToPKR(payload.creditLimit, selectedCurrency);
    }
    const response = await apiClient.put(`/customers/${id}`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },
};
