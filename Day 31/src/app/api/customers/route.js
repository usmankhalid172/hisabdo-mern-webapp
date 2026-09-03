import { NextResponse } from 'next/server';
import store from '../../../lib/db-store';
import { customerCreateSchema } from '../../../lib/validations/customerSchema';
import { validateRequestBody } from '../../../lib/validations/validate';

// GET /api/customers - List all customers with search, category, and balance filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const balanceType = searchParams.get('balanceType') || undefined; // 'receivable' | 'payable' | 'settled'
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const customers = await store.getCustomers({ search, category, balanceType, sortBy, sortOrder });
    const stats = await store.getOverallStats();

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
      stats: {
        totalCustomers: stats.totalCustomers,
        totalReceivable: stats.totalReceivable,
        totalCustomerAdvance: stats.totalCustomerAdvance
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/customers - Register a new customer
export async function POST(req) {
  try {
    const validation = await validateRequestBody(customerCreateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const payload = validation.data;

    // Check duplicate phone
    const existing = await store.getCustomers({ search: payload.phone });
    const isDuplicate = existing.some(c => c.phone.replace(/\s+/g, '') === payload.phone.replace(/\s+/g, ''));
    if (isDuplicate) {
      return NextResponse.json({
        success: false,
        error: 'A customer with this mobile number is already registered.',
        fieldErrors: { phone: 'This mobile number is already assigned to an existing customer' }
      }, { status: 409 });
    }

    const newCustomer = await store.createCustomer(payload);

    return NextResponse.json({
      success: true,
      message: 'Customer registered successfully',
      data: newCustomer
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
