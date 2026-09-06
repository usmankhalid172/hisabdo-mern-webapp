import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import Vendor from '@/models/Vendor';
import { requireAuth } from '@/lib/server-auth';
import { transactionUpdateSchema } from '@/lib/validations/transactionSchema';

async function recalculate(userId: string, customerId?: string | null, vendorId?: string | null) {
  if (customerId) {
    const txs = await Transaction.find({ userId, customerId }).sort({ date: 1, createdAt: 1 });
    let balance = 0;
    for (const tx of txs) { balance += tx.type === 'GAVE_CREDIT' ? tx.amount : tx.type === 'GOT_PAYMENT' ? -tx.amount : 0; tx.balanceAfter = balance; await tx.save(); }
    await Customer.findOneAndUpdate({ _id: customerId, userId }, { netBalance: balance });
  }
  if (vendorId) {
    const txs = await Transaction.find({ userId, vendorId }).sort({ date: 1, createdAt: 1 });
    let balance = 0;
    for (const tx of txs) { balance += tx.type === 'PURCHASE_BILL' ? tx.amount : tx.type === 'PAID_PAYMENT' ? -tx.amount : 0; tx.balanceAfter = balance; await tx.save(); }
    await Vendor.findOneAndUpdate({ _id: vendorId, userId }, { payableBalance: balance });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request);
    if (!mongoose.isValidObjectId(params.id)) return NextResponse.json({ success: false, message: 'Invalid transaction id' }, { status: 400 });
    const body = await request.json();
    const validation = transactionUpdateSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ success: false, message: validation.error.issues[0]?.message || 'Validation failed', fieldErrors: validation.error.flatten().fieldErrors }, { status: 400 });
    await connectDB();
    const existing = await Transaction.findOne({ _id: params.id, userId: user.id });
    if (!existing) return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    const customerId = existing.customerId?.toString();
    const vendorId = existing.vendorId?.toString();
    Object.assign(existing, validation.data);
    if (validation.data.date) existing.date = new Date(validation.data.date);
    await existing.save();
    await recalculate(user.id, customerId, vendorId);
    const updated = await Transaction.findById(existing._id).lean();
    return NextResponse.json({ success: true, message: 'Transaction updated successfully', transaction: updated, data: updated });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(request);
    await connectDB();
    const tx = await Transaction.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!tx) return NextResponse.json({ success: false, message: 'Transaction not found' }, { status: 404 });
    await recalculate(user.id, tx.customerId?.toString(), tx.vendorId?.toString());
    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
