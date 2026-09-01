import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyAuthToken } from '@/lib/auth-token';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createSupabaseClient(url, serviceKey);
}

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined') {
      const user = await verifyAuthToken(token);
      if (user) return user;
    }
  }

  const cookieToken =
    request.cookies.get('hisabdo_auth_token')?.value ||
    request.cookies.get('token')?.value ||
    request.cookies.get('accessToken')?.value;

  if (cookieToken) {
    const user = await verifyAuthToken(cookieToken);
    if (user) return user;
  }

  return null;
}

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getAdminSupabase();

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase Dashboard Fetch Error:', error);
      throw error;
    }

    let totalReceivables = 0;
    let totalPayables = 0;

    (transactions || []).forEach((t) => {
      const amount = Number(t.amount) || 0;
      const typeLower = (t.type || '').toLowerCase();
      if (typeLower === 'income' || typeLower === 'inflow' || typeLower === 'cash_in') {
        totalReceivables += amount;
      } else if (typeLower === 'expense' || typeLower === 'outflow' || typeLower === 'cash_out') {
        totalPayables += amount;
      }
    });

    const netBalance = totalReceivables - totalPayables;

    return NextResponse.json({
      success: true,
      totalReceivables,
      totalPayables,
      netBalance,
      // Fallbacks for alternative naming conventions used by frontend cards
      totalCashIn: totalReceivables,
      totalCashOut: totalPayables,
      summary: {
        totalReceivables,
        totalPayables,
        totalCashIn: totalReceivables,
        totalCashOut: totalPayables,
        netBalance,
      },
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('GET /api/dashboard/summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}