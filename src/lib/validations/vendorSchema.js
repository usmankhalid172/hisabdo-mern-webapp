import { z } from 'zod';
import { pakistaniPhoneRegex } from './customerSchema';

export const vendorCreateSchema = z.object({
  name: z.string({ required_error: 'Contact person name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  companyName: z.string({ required_error: 'Company / Shop name is required' })
    .trim()
    .min(2, 'Company name must be at least 2 characters')
    .max(120, 'Company name cannot exceed 120 characters'),
  phone: z.string({ required_error: 'Phone number is required' })
    .trim()
    .refine((val) => pakistaniPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Pakistani mobile number (e.g. +923001234567 or 03001234567)'
    }),
  email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().trim().max(250, 'Address cannot exceed 250 characters').optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City must be at least 2 characters').default('Karachi'),
  category: z.enum(['Raw Material', 'Finished Goods', 'Packaging', 'Logistics', 'Services', 'Wholesale Supplier'], {
    errorMap: () => ({ message: 'Category must be a valid supplier category' })
  }).default('Wholesale Supplier'),
  bankName: z.string().trim().default('Meezan Bank Ltd'),
  accountTitle: z.string().trim().max(100).optional().or(z.literal('')),
  accountNumber: z.string().trim().max(50).optional().or(z.literal('')),
  initialBalance: z.union([z.number(), z.string()])
    .transform((val) => (val === '' ? 0 : Number(val)))
    .pipe(z.number().min(-10000000, 'Amount out of bounds').max(10000000, 'Amount out of bounds'))
    .default(0),
  status: z.enum(['active', 'inactive', 'blocked']).default('active'),
  paymentTermsDays: z.union([z.number(), z.string()])
    .transform((val) => (val === '' ? 30 : Number(val)))
    .pipe(z.number().min(0, 'Days cannot be negative').max(365, 'Payment terms cannot exceed 365 days'))
    .default(30)
});

export const vendorUpdateSchema = vendorCreateSchema.partial();

export const vendorQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['payable', 'paid', 'advance', 'all']).optional(),
  sortBy: z.enum(['name', 'companyName', 'payableBalance', 'createdAt', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().optional().transform((v) => (v ? Math.max(1, parseInt(v, 10)) : 1)),
  limit: z.string().optional().transform((v) => (v ? Math.min(100, Math.max(1, parseInt(v, 10))) : 20))
});
