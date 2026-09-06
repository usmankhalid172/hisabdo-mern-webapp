import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { transactionCreateSchema } from '@/lib/validations/transactionSchema';

export async function GET(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const vendor = await Vendor.findOne({ _id: params.id, userId: user.id }).lean();
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    const transactions = await Transaction.find({ vendorId: params.id, userId: user.id }).sort({ date: 1, createdAt: 1 }).lean();
    return NextResponse.json({ success: true, count: transactions.length, vendor: { _id: vendor._id, name: vendor.name, companyName: vendor.companyName, phone: vendor.phone, payableBalance: vendor.payableBalance }, data: transactions });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function POST(req, { params }) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const validation = transactionCreateSchema.safeParse({ ...body, partyType: 'Vendor', customerId: null, vendorId: params.id });
    if (!validation.success) return NextResponse.json({ success: false, error: validation.error.issues[0]?.message || 'Validation failed', fieldErrors: validation.error.flatten().fieldErrors }, { status: 400 });
    await connectDB();
    const vendor = await Vendor.findOne({ _id: params.id, userId: user.id }).lean();
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    const tx = await Transaction.create({ ...validation.data, userId: user.id, date: new Date(validation.data.date) });
    const txs = await Transaction.find({ vendorId: params.id, userId: user.id }).sort({ date: 1, createdAt: 1 });
    let balance = 0;
    for (const item of txs) { balance += item.type === 'PURCHASE_BILL' ? item.amount : item.type === 'PAID_PAYMENT' ? -item.amount : 0; item.balanceAfter = balance; await item.save(); }
    const updatedVendor = await Vendor.findOneAndUpdate({ _id: params.id, userId: user.id }, { payableBalance: balance }, { new: true }).lean();
    return NextResponse.json({ success: true, message: 'Vendor transaction recorded successfully', data: await Transaction.findById(tx._id).lean(), vendor: updatedVendor }, { status: 201 });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
