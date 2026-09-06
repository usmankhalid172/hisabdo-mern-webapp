import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Customer from '@/models/Customer';
import Vendor from '@/models/Vendor';
import { requireAuth } from '@/lib/server-auth';

export async function GET(req) {
  try {
    const user = await requireAuth(req);
    await connectDB();
    const [customers, vendors] = await Promise.all([
      Customer.find({ userId: user.id }).select('netBalance').lean(),
      Vendor.find({ userId: user.id }).select('payableBalance').lean(),
    ]);
    const data = {
      totalCustomers: customers.length,
      totalVendors: vendors.length,
      totalReceivable: customers.reduce((s, c) => s + Math.max(0, Number(c.netBalance || 0)), 0),
      totalCustomerAdvance: customers.reduce((s, c) => s + Math.max(0, -Number(c.netBalance || 0)), 0),
      totalPayable: vendors.reduce((s, v) => s + Math.max(0, Number(v.payableBalance || 0)), 0),
      totalVendorAdvance: vendors.reduce((s, v) => s + Math.max(0, -Number(v.payableBalance || 0)), 0),
    };
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const status = error?.message === 'UNAUTHORIZED' ? 401 : 500;
    return NextResponse.json({ success: false, error: status === 401 ? 'Unauthorized' : error.message }, { status });
  }
}
