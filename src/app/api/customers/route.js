import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';
import { customerCreateSchema } from '@/lib/validations/customerSchema';
import { validateRequestBody } from '@/lib/validations/validate';

export async function GET(req) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const balanceType = searchParams.get('balanceType');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const filter = { userId: new mongoose.Types.ObjectId(user.id) };
    if (category && category !== 'All') filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (balanceType === 'receivable') filter.netBalance = { $gt: 0 };
    if (balanceType === 'payable') filter.netBalance = { $lt: 0 };
    if (balanceType === 'settled') filter.netBalance = 0;

    const customers = await Customer.find(filter).sort({ [sortBy]: sortOrder }).lean();
    const all = await Customer.find({ userId: user.id }).select('netBalance').lean();
    const stats = all.reduce((acc, c) => {
      if (c.netBalance > 0) acc.totalReceivable += c.netBalance;
      if (c.netBalance < 0) acc.totalCustomerAdvance += Math.abs(c.netBalance);
      return acc;
    }, { totalReceivable: 0, totalCustomerAdvance: 0 });

    return NextResponse.json({
      success: true,
      count: customers.length,
      data: customers,
      stats: { totalCustomers: all.length, ...stats },
    });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth(req);
    const validation = await validateRequestBody(customerCreateSchema, req);
    if (!validation.success) return validation.response;

    await connectDB();
    const payload = validation.data;
    const normalizedPhone = payload.phone.replace(/\s+/g, '');
    const duplicate = await Customer.findOne({ userId: user.id, phone: normalizedPhone }).lean();
    if (duplicate) {
      return NextResponse.json({ success: false, error: 'A customer with this mobile number is already registered.', fieldErrors: { phone: 'This mobile number is already assigned to an existing customer' } }, { status: 409 });
    }

    const initialBalance = Number(payload.initialBalance || 0);
    const customer = await Customer.create({ ...payload, phone: normalizedPhone, userId: user.id, netBalance: initialBalance });

    if (initialBalance !== 0) {
      await Transaction.create({
        userId: user.id,
        partyType: 'Customer',
        customerId: customer._id,
        type: initialBalance > 0 ? 'GAVE_CREDIT' : 'GOT_PAYMENT',
        amount: Math.abs(initialBalance),
        paymentMethod: 'Cash',
        billNumber: 'OPENING',
        description: 'Opening balance registration',
        balanceAfter: initialBalance,
      });
    }

    return NextResponse.json({ success: true, message: 'Customer registered successfully', data: customer }, { status: 201 });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
