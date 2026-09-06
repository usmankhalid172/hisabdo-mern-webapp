import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { customerUpdateSchema } from '@/lib/validations/customerSchema';
import { validateRequestBody } from '@/lib/validations/validate';

export async function GET(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ success: false, error: 'Invalid customer id' }, { status: 400 });
    const customer = await Customer.findOne({ _id: params.id, userId: user.id }).lean();
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    const transactions = await Transaction.find({ customerId: params.id, userId: user.id }).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, data: { ...customer, transactionsCount: transactions.length, recentTransactions: transactions.slice(0, 5) } });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await requireAuth(req);
    const validation = await validateRequestBody(customerUpdateSchema, req);
    if (!validation.success) return validation.response;
    await connectDB();
    const updated = await Customer.findOneAndUpdate({ _id: params.id, userId: user.id }, validation.data, { new: true, runValidators: true }).lean();
    if (!updated) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Customer profile updated successfully', data: updated });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const deleted = await Customer.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!deleted) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    await Transaction.deleteMany({ customerId: params.id, userId: user.id });
    return NextResponse.json({ success: true, message: 'Customer account and associated ledger records deleted successfully' });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
