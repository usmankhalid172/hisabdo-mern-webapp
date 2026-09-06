import { NextResponse } from 'next/server';
import store from '../../../lib/db-store';

// POST /api/seed - Reset and seed sample Pakistani customers and vendors
export async function POST() {
  try {
    store.resetToInitial();
    const stats = await store.getOverallStats();
    return NextResponse.json({
      success: true,
      message: 'Pakistani Customers and Vendors dataset seeded successfully',
      stats
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
