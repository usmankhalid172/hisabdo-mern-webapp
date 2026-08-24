import { NextResponse } from 'next/server';
import store from '../../../../lib/db-store';
import { transactionUpdateSchema } from '../../../../lib/validations/transactionSchema';
import { validateRequestBody } from '../../../../lib/validations/validate';

// PUT /api/transactions/[id] - Update transaction and recalculate balance
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const validation = await validateRequestBody(transactionUpdateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const updated = await store.updateTransaction(id, validation.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Transaction record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction updated and party ledger balance recalculated successfully',
      data: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/transactions/[id] - Delete transaction and restore balance
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deleted = await store.deleteTransaction(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Transaction record not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction deleted and party balance adjusted successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
