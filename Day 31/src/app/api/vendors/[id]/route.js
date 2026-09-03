import { NextResponse } from 'next/server';
import store from '../../../../lib/db-store';
import { vendorUpdateSchema } from '../../../../lib/validations/vendorSchema';
import { validateRequestBody } from '../../../../lib/validations/validate';

// GET /api/vendors/[id] - Single vendor profile & recent ledger
export async function GET(req, { params }) {
  try {
    const { id } = params;
    const vendor = await store.getVendorById(id);

    if (!vendor) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: vendor });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/vendors/[id] - Update vendor profile
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const validation = await validateRequestBody(vendorUpdateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const updated = await store.updateVendor(id, validation.data);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor profile updated successfully',
      data: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/vendors/[id] - Cascade delete vendor & purchase transactions
export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const deleted = await store.deleteVendor(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Vendor account and all supplier transactions deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
