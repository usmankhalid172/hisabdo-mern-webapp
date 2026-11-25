import apiClient from '@/lib/axios';
import { convertFromPKR, getUserCurrency } from '@/services/currencyService';

export const dashboardService = {
  getSummary: async () => {
    const response = await apiClient.get('/dashboard/summary');
    const data = response.data;
    const targetCurrency = getUserCurrency();
    if (!data || targetCurrency === 'PKR') {
      return data;
    }

    const convertField = (val) =>
      val !== undefined && val !== null ? convertFromPKR(val, targetCurrency) : Promise.resolve(val);

    const [
      totalReceivables,
      totalPayables,
      netBalance,
      totalCashIn,
      totalCashOut,
      transactions,
    ] = await Promise.all([
      convertField(data.totalReceivables),
      convertField(data.totalPayables),
      convertField(data.netBalance),
      convertField(data.totalCashIn),
      convertField(data.totalCashOut),
      Array.isArray(data.transactions)
        ? Promise.all(
            data.transactions.map(async (tx) => ({
              ...tx,
              amount: await convertFromPKR(tx.amount, targetCurrency),
            }))
          )
        : Promise.resolve(data.transactions),
    ]);

    return {
      ...data,
      totalReceivables,
      totalPayables,
      netBalance,
      totalCashIn,
      totalCashOut,
      summary: data.summary
        ? {
            ...data.summary,
            totalReceivables,
            totalPayables,
            totalCashIn,
            totalCashOut,
            netBalance,
          }
        : data.summary,
      transactions,
    };
  },
};
