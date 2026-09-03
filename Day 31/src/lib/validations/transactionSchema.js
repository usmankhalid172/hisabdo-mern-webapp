import { z } from 'zod';

export const transactionCreateSchema = z.object({
  partyType: z.enum(['Customer', 'Vendor'], {
    errorMap: () => ({ message: 'Party type must be Customer or Vendor' })
  }),
  customerId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  type: z.enum(['GAVE_CREDIT', 'GOT_PAYMENT', 'PURCHASE_BILL', 'PAID_PAYMENT'], {
    errorMap: () => ({ message: 'Transaction type must be GAVE_CREDIT, GOT_PAYMENT, PURCHASE_BILL, or PAID_PAYMENT' })
  }),
  amount: z.union([z.number(), z.string()])
    .transform((val) => Number(val))
    .pipe(z.number({ required_error: 'Amount is required' })
      .positive('Transaction amount must be strictly greater than 0')
      .max(10000000, 'Transaction amount cannot exceed Rs. 10,000,000')
    ),
  date: z.string().optional().default(() => new Date().toISOString()),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Cheque', 'Credit Card']).default('Cash'),
  billNumber: z.string().trim().max(50, 'Bill number cannot exceed 50 characters').optional().or(z.literal('')),
  description: z.string().trim().max(300, 'Description cannot exceed 300 characters').optional().or(z.literal(''))
}).refine((data) => {
  if (data.partyType === 'Customer' && !data.customerId) {
    return false;
  }
  if (data.partyType === 'Vendor' && !data.vendorId) {
    return false;
  }
  return true;
}, {
  message: 'customerId or vendorId must be supplied based on partyType'
});

export const transactionUpdateSchema = z.object({
  amount: z.union([z.number(), z.string()])
    .transform((val) => Number(val))
    .pipe(z.number().positive('Amount must be positive'))
    .optional(),
  type: z.enum(['GAVE_CREDIT', 'GOT_PAYMENT', 'PURCHASE_BILL', 'PAID_PAYMENT']).optional(),
  paymentMethod: z.enum(['Cash', 'Bank Transfer', 'EasyPaisa', 'JazzCash', 'Cheque', 'Credit Card']).optional(),
  billNumber: z.string().trim().max(50).optional(),
  description: z.string().trim().max(300).optional(),
  date: z.string().optional()
});
