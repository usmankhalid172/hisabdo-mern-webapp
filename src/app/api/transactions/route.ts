import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Transaction from '@/models/Transaction';
import Customer from '@/models/Customer';
import Vendor from '@/models/Vendor';
import { requireAuth } from '@/lib/server-auth';
import { transactionCreateSchema } from '@/lib/validations/transactionSchema';

async function recalculateCustomer(userId: string, customerId: string) {
  const txs = await Transaction.find({ userId, customerId }).sort({ date: 1, createdAt: 1 });
  let balance = 0;
  for (const tx of txs) {
    balance += tx.type === 'GAVE_CREDIT' ? tx.amount : tx.type === 'GOT_PAYMENT' ? -tx.amount : 0;
    tx.balanceAfter = balance;
    await tx.save();
  }
  await Customer.findOneAndUpdate({ _id: customerId, userId }, { netBalance: balance });
}

async function recalculateVendor(userId: string, vendorId: string) {
  const txs = await Transaction.find({ userId, vendorId }).sort({ date: 1, createdAt: 1 });
  let balance = 0;
  for (const tx of txs) {
    balance += tx.type === 'PURCHASE_BILL' ? tx.amount : tx.type === 'PAID_PAYMENT' ? -tx.amount : 0;
    tx.balanceAfter = balance;
    await tx.save();
  }
  await Vendor.findOneAndUpdate({ _id: vendorId, userId }, { payableBalance: balance });
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    await connectDB();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const vendorId = searchParams.get('vendorId');
    const partyType = searchParams.get('partyType');
    const filter: any = { userId: new mongoose.Types.ObjectId(user.id) };
    if (customerId) filter.customerId = customerId;
    if (vendorId) filter.vendorId = vendorId;
    if (partyType) filter.partyType = partyType;
    const transactions = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, count: transactions.length, transactions, data: transactions });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validation = transactionCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, message: validation.error.issues[0]?.message || 'Validation failed', fieldErrors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    await connectDB();
    const data = validation.data;
    if (data.customerId && !mongoose.isValidObjectId(data.customerId)) return NextResponse.json({ success: false, message: 'Invalid customer id' }, { status: 400 });
    if (data.vendorId && !mongoose.isValidObjectId(data.vendorId)) return NextResponse.json({ success: false, message: 'Invalid vendor id' }, { status: 400 });

    if (data.partyType === 'Customer') {
      const customer = await Customer.findOne({ _id: data.customerId, userId: user.id }).lean();
      if (!customer) return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 });
      if (data.type !== 'GAVE_CREDIT' && data.type !== 'GOT_PAYMENT') return NextResponse.json({ success: false, message: 'Invalid customer transaction type' }, { status: 400 });
    } else {
      const vendor = await Vendor.findOne({ _id: data.vendorId, userId: user.id }).lean();
      if (!vendor) return NextResponse.json({ success: false, message: 'Vendor not found' }, { status: 404 });
      if (data.type !== 'PURCHASE_BILL' && data.type !== 'PAID_PAYMENT') return NextResponse.json({ success: false, message: 'Invalid vendor transaction type' }, { status: 400 });
    }

    const tx = await Transaction.create({ ...data, userId: user.id, date: new Date(data.date) });
    if (tx.customerId) await recalculateCustomer(user.id, tx.customerId.toString());
    if (tx.vendorId) await recalculateVendor(user.id, tx.vendorId.toString());
    const saved = await Transaction.findById(tx._id).lean();
    return NextResponse.json({ success: true, message: 'Transaction created successfully', transaction: saved, data: saved }, { status: 201 });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
