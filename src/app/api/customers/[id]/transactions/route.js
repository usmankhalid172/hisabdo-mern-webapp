import { NextResponse } from 'next/server';
import store from '../../../../../lib/db-store';
import { transactionCreateSchema } from '../../../../../lib/validations/transactionSchema';
import { validateRequestBody } from '../../../../../lib/validations/validate';

// GET /api/customers/[id]/transactions - Get customer ledger entries with running balance
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const customer = await store.getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const transactions = await store.getTransactionsByCustomer(id);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        netBalance: customer.netBalance,
        creditLimit: customer.creditLimit
      },
      data: transactions
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/customers/[id]/transactions - Record customer Credit or Payment Wasooli
export async function POST(req, { params }) {
  try {
    const { id } = params;
    const customer = await store.getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    const validation = await validateRequestBody(transactionCreateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const payload = {
      ...validation.data,
      partyType: 'Customer',
      customerId: id
    };

    const newTx = await store.addTransaction(payload);
    const updatedCustomer = await store.getCustomerById(id);

    return NextResponse.json({
      success: true,
      message: 'Transaction recorded successfully',
      data: newTx,
      customer: updatedCustomer
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
