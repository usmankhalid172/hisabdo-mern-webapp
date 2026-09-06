import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Vendor from '@/models/Vendor';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';

export async function GET(req) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const [customers, vendors, transactions] = await Promise.all([
      Customer.find({ userId: user.id }).lean(),
      Vendor.find({ userId: user.id }).lean(),
      Transaction.find({ userId: user.id }).sort({ date: -1 }).lean(),
    ]);

    const summary = {
      totalCustomers: customers.length,
      totalVendors: vendors.length,
      totalReceivable: customers.reduce((s, c) => s + Math.max(0, Number(c.netBalance || 0)), 0),
      totalPayable: vendors.reduce((s, v) => s + Math.max(0, Number(v.payableBalance || 0)), 0),
      totalCashIn: transactions.filter(t => t.type === 'GOT_PAYMENT').reduce((s, t) => s + Number(t.amount || 0), 0),
      totalCashOut: transactions.filter(t => t.type === 'PAID_PAYMENT').reduce((s, t) => s + Number(t.amount || 0), 0),
    };
    return NextResponse.json({ success: true, data: { summary, customers, vendors, transactions } });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : 'Failed to generate report data' }, { status });
  }
}
