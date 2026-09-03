import { NextResponse } from 'next/server';
import store from '../../../../../lib/db-store';
import { transactionCreateSchema } from '../../../../../lib/validations/transactionSchema';
import { validateRequestBody } from '../../../../../lib/validations/validate';

// GET /api/vendors/[id]/transactions - Get vendor supplier ledger entries with running balance
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const vendor = await store.getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    const transactions = await store.getTransactionsByVendor(id);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        companyName: vendor.companyName,
        phone: vendor.phone,
        payableBalance: vendor.payableBalance,
        bankName: vendor.bankName,
        accountNumber: vendor.accountNumber
      },
      data: transactions
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/vendors/[id]/transactions - Record vendor Purchase Bill or Payment Paid
export async function POST(req, { params }) {
  try {
    const { id } = params;
    const vendor = await store.getVendorById(id);
    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    const validation = await validateRequestBody(transactionCreateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const payload = {
      ...validation.data,
      partyType: 'Vendor',
      vendorId: id
    };

    const newTx = await store.addTransaction(payload);
    const updatedVendor = await store.getVendorById(id);

    return NextResponse.json({
      success: true,
      message: 'Vendor transaction recorded successfully',
      data: newTx,
      vendor: updatedVendor
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
