import { NextResponse } from 'next/server';
import store from '../../../lib/db-store';
import { vendorCreateSchema } from '../../../lib/validations/vendorSchema';
import { validateRequestBody } from '../../../lib/validations/validate';

// GET /api/vendors - List all vendors with search, category, and status filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined; // 'payable' | 'paid' | 'advance'
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const vendors = await store.getVendors({ search, category, status, sortBy, sortOrder });
    const stats = await store.getOverallStats();

    return NextResponse.json({
      success: true,
      count: vendors.length,
      data: vendors,
      stats: {
        totalVendors: stats.totalVendors,
        totalPayable: stats.totalPayable,
        totalVendorAdvance: stats.totalVendorAdvance
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/vendors - Register a new supplier / vendor
export async function POST(req) {
  try {
    const validation = await validateRequestBody(vendorCreateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const payload = validation.data;

    // Check duplicate phone
    const existing = await store.getVendors({ search: payload.phone });
    const isDuplicate = existing.some(v => v.phone.replace(/\s+/g, '') === payload.phone.replace(/\s+/g, ''));
    if (isDuplicate) {
      return NextResponse.json({
        success: false,
        error: 'A vendor with this mobile number is already registered.',
        fieldErrors: { phone: 'This mobile number is already assigned to an existing supplier' }
      }, { status: 409 });
    }

    const newVendor = await store.createVendor(payload);

    return NextResponse.json({
      success: true,
      message: 'Vendor / Supplier registered successfully',
      data: newVendor
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
