import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { vendorUpdateSchema } from '@/lib/validations/vendorSchema';
import { validateRequestBody } from '@/lib/validations/validate';

export async function GET(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const vendor = await Vendor.findOne({ _id: params.id, userId: user.id }).lean();
    if (!vendor) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    const transactions = await Transaction.find({ vendorId: params.id, userId: user.id }).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, data: { ...vendor, transactionsCount: transactions.length, recentTransactions: transactions.slice(0, 5) } });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await requireAuth(req);
    const validation = await validateRequestBody(vendorUpdateSchema, req);
    if (!validation.success) return validation.response;
    await connectDB();
    const updated = await Vendor.findOneAndUpdate({ _id: params.id, userId: user.id }, validation.data, { new: true, runValidators: true }).lean();
    if (!updated) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Vendor profile updated successfully', data: updated });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const deleted = await Vendor.findOneAndDelete({ _id: params.id, userId: user.id });
    if (!deleted) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    await Transaction.deleteMany({ vendorId: params.id, userId: user.id });
    return NextResponse.json({ success: true, message: 'Vendor account and all supplier transactions deleted successfully' });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
