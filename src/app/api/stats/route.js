import { NextResponse } from 'next/server';
import store from '../../../lib/db-store';

// GET /api/stats - High level financial dashboard metrics combining Customers & Vendors
export async function GET() {
  try {
    const stats = await store.getOverallStats();
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
