import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Vendor from '@/models/Vendor';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { vendorCreateSchema } from '@/lib/validations/vendorSchema';
import { validateRequestBody } from '@/lib/validations/validate';

export async function GET(req) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const filter = { userId: new mongoose.Types.ObjectId(user.id) };
    if (category && category !== 'All') filter.category = category;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { companyName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    if (status === 'payable') filter.payableBalance = { $gt: 0 };
    if (status === 'paid') filter.payableBalance = 0;
    if (status === 'advance') filter.payableBalance = { $lt: 0 };

    const vendors = await Vendor.find(filter).sort({ [sortBy]: sortOrder }).lean();
    const all = await Vendor.find({ userId: user.id }).select('payableBalance').lean();
    const stats = all.reduce((acc, v) => {
      if (v.payableBalance > 0) acc.totalPayable += v.payableBalance;
      if (v.payableBalance < 0) acc.totalVendorAdvance += Math.abs(v.payableBalance);
      return acc;
    }, { totalPayable: 0, totalVendorAdvance: 0 });
    return NextResponse.json({ success: true, count: vendors.length, data: vendors, stats: { totalVendors: all.length, ...stats } });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth(req);
    const validation = await validateRequestBody(vendorCreateSchema, req);
    if (!validation.success) return validation.response;
    await connectDB();
    const payload = validation.data;
    const normalizedPhone = payload.phone.replace(/\s+/g, '');
    const duplicate = await Vendor.findOne({ userId: user.id, phone: normalizedPhone }).lean();
    if (duplicate) return NextResponse.json({ success: false, error: 'A vendor with this mobile number is already registered.', fieldErrors: { phone: 'This mobile number is already assigned to an existing supplier' } }, { status: 409 });

    const initialBalance = Number(payload.initialBalance || 0);
    const vendor = await Vendor.create({ ...payload, phone: normalizedPhone, userId: user.id, payableBalance: initialBalance });
    if (initialBalance !== 0) {
      await Transaction.create({
        userId: user.id,
        partyType: 'Vendor',
        vendorId: vendor._id,
        type: initialBalance > 0 ? 'PURCHASE_BILL' : 'PAID_PAYMENT',
        amount: Math.abs(initialBalance),
        paymentMethod: 'Bank Transfer',
        billNumber: 'OPENING-BILL',
        description: 'Opening vendor balance registration',
        balanceAfter: initialBalance,
      });
    }
    return NextResponse.json({ success: true, message: 'Vendor / Supplier registered successfully', data: vendor }, { status: 201 });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
