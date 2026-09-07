import { NextResponse } from 'next/server';
import store from '../../../../lib/db-store';
import { customerUpdateSchema } from '../../../../lib/validations/customerSchema';
import { validateRequestBody } from '../../../../lib/validations/validate';

// GET /api/customers/[id] - Single customer profile & history
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const customer = await store.getCustomerById(id);

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: customer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/customers/[id] - Update customer profile
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const validation = await validateRequestBody(customerUpdateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const updated = await store.updateCustomer(id, validation.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Customer profile updated successfully',
      data: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/customers/[id] - Cascade delete customer & transactions
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deleted = await store.deleteCustomer(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Customer account and associated ledger records deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
