import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { transactionCreateSchema } from '@/lib/validations/transactionSchema';

export async function GET(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const customer = await Customer.findOne({ _id: params.id, userId: user.id }).lean();
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    const transactions = await Transaction.find({ customerId: params.id, userId: user.id }).sort({ date: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, count: transactions.length, customer: { _id: customer._id, name: customer.name, phone: customer.phone, netBalance: customer.netBalance, creditLimit: customer.creditLimit }, data: transactions });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const validation = transactionCreateSchema.safeParse({ ...body, partyType: 'Customer', customerId: params.id, vendorId: null });
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message || 'Validation failed', fieldErrors: validation.error.flatten().fieldErrors }, { status: 400 });
    await connectDB();
    const customer = await Customer.findOne({ _id: params.id, userId: user.id }).lean();
    if (!customer) return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    const tx = await Transaction.create({ ...validation.data, userId: user.id, date: new Date(validation.data.date) });
    const txs = await Transaction.find({ customerId: params.id, userId: user.id }).sort({ date: 1, createdAt: 1 });
    let balance = 0;
    for (const item of txs) { balance += item.type === 'GAVE_CREDIT' ? item.amount : item.type === 'GOT_PAYMENT' ? -item.amount : 0; item.balanceAfter = balance; await item.save(); }
    const updatedCustomer = await Customer.findOneAndUpdate({ _id: params.id, userId: user.id }, { netBalance: balance }, { new: true }).lean();
    return NextResponse.json({ success: true, message: 'Transaction recorded successfully', data: await Transaction.findById(tx._id).lean(), customer: updatedCustomer }, { status: 201 });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
