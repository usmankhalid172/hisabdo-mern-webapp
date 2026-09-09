import { z } from 'zod';

export const pakistaniPhoneRegex = /^(?:\+92|92|0)?3[0-9]{9}$/;

export const customerCreateSchema = z.object({
  name: z.string({ required_error: 'Customer name is required' })
    .trim()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name cannot exceed 100 characters'),
  phone: z.string({ required_error: 'Phone number is required' })
    .trim()
    .refine((val) => pakistaniPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Pakistani mobile number (e.g. +923001234567 or 03001234567)'
    }),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().max(250, 'Address cannot exceed 250 characters').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City must be at least 2 characters').default('Lahore'),
  category: z.enum(['Retail', 'Wholesale', 'Distributor', 'VIP', 'General'], {
    errorMap: () => ({ message: 'Category must be Retail, Wholesale, Distributor, VIP, or General' })
  }).default('Retail'),
  creditLimit: z.union([z.number(), z.string()])
    .transform((val) => (val === '' ? 0 : Number(val)))
    .pipe(z.number().min(0, 'Credit limit cannot be negative').max(10000000, 'Credit limit exceeds maximum allowed limit'))
    .default(50000),
  initialBalance: z.union([z.number(), z.string()])
    .transform((val) => (val === '' ? 0 : Number(val)))
    .pipe(z.number().min(-10000000, 'Amount out of bounds').max(10000000, 'Amount out of bounds'))
    .default(0),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  paymentTermsDays: z.union([z.number(), z.string()])
    .transform((val) => (val === '' ? 15 : Number(val)))
    .pipe(z.number().min(0, 'Days cannot be negative').max(365, 'Payment terms cannot exceed 365 days'))
    .default(15)
});

export const customerUpdateSchema = customerCreateSchema.partial();

export const customerQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  balanceType: z.enum(['receivable', 'payable', 'settled', 'all']).optional(),
  sortBy: z.enum(['name', 'netBalance', 'creditLimit', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20))
});
