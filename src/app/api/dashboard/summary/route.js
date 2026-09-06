import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Vendor from '@/models/Vendor';
import Transaction from '@/models/Transaction';
import { requireAuth } from '@/lib/server-auth';

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    await connectDB();
    const filter = { userId: user.id };
    const [customers, vendors, transactions] = await Promise.all([
      Customer.find(filter).select('netBalance').lean(),
      Vendor.find(filter).select('payableBalance').lean(),
      Transaction.find(filter).sort({ date: -1, createdAt: -1 }).limit(100).lean(),
    ]);

    const totalReceivables = customers.reduce((s, c) => s + Math.max(0, Number(c.netBalance || 0)), 0);
    const totalPayables = vendors.reduce((s, v) => s + Math.max(0, Number(v.payableBalance || 0)), 0);
    const totalCashIn = transactions.filter(t => t.type === 'GOT_PAYMENT').reduce((s, t) => s + Number(t.amount || 0), 0);
    const totalCashOut = transactions.filter(t => t.type === 'PAID_PAYMENT').reduce((s, t) => s + Number(t.amount || 0), 0);
    const netBalance = totalCashIn - totalCashOut;

    return NextResponse.json({
      success: true,
      totalReceivables,
      totalPayables,
      totalCashIn,
      totalCashOut,
      netBalance,
      summary: { totalReceivables, totalPayables, totalCashIn, totalCashOut, netBalance },
      transactions,
    });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, message: status === 401 ? 'Unauthorized' : 'Failed to fetch dashboard summary' }, { status });
  }
}
