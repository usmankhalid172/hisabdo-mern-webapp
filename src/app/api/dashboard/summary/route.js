import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      totalReceivables: 0,
      totalPayables: 500,
      netBalance: -500,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}