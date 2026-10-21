import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/server-auth';
import { supabaseServer } from '@/lib/supabase/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import store from '../../../../lib/db-store';
import { customerUpdateSchema } from '../../../../lib/validations/customerSchema';
import { validateRequestBody } from '../../../../lib/validations/validate';

// Normalize a name: trim, collapse whitespace, lowercase
function normalizeName(name) {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

// Convert a phone number to E.164 format. Returns null if invalid.
function toE164(phone) {
  const trimmed = phone.trim();
  if (!trimmed) return null;

  const parsed = parsePhoneNumberFromString(trimmed, 'PK');
  if (parsed && parsed.isValid()) return parsed.number;

  const parsedIntl = parsePhoneNumberFromString(trimmed);
  if (parsedIntl && parsedIntl.isValid()) return parsedIntl.number;

  return null;
}

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

// PUT /api/customers/[id] - Update customer profile (Supabase — same source as create)
export async function PUT(req, { params }) {
  try {
    const user = await requireAuth(req);

    const { id } = params;
    const validation = await validateRequestBody(customerUpdateSchema, req);
    if (!validation.success) {
      return validation.response;
    }

    const updates = validation.data;

    // Normalize phone to E.164 if provided
    let e164Phone = null;
    if (updates.phone !== undefined) {
      if (updates.phone && String(updates.phone).trim()) {
        e164Phone = toE164(String(updates.phone));
        if (!e164Phone) {
          return NextResponse.json(
            { success: false, message: 'Invalid phone number format' },
            { status: 400 }
          );
        }
      }
    }

    // Fetch this user's customers (excluding the customer being edited) for duplicate check
    const { data: existingCustomers, error: fetchError } = await supabaseServer
      .from('customers')
      .select('id, name, phone')
      .eq('user_id', user.id);

    if (fetchError) {
      return NextResponse.json(
        { success: false, message: 'Failed to verify duplicates' },
        { status: 500 }
      );
    }

    const otherCustomers = (existingCustomers || []).filter((c) => c.id !== id);

    // Duplicate name check (case-insensitive, whitespace-normalized)
    if (updates.name && String(updates.name).trim()) {
      const normalizedName = normalizeName(String(updates.name));
      const nameMatch = otherCustomers.find(
        (c) => c.name && normalizeName(c.name) === normalizedName
      );
      if (nameMatch) {
        return NextResponse.json(
          { success: false, message: 'A customer with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Duplicate phone check (E.164 comparison — empty phone is not checked)
    if (e164Phone) {
      const phoneMatch = otherCustomers.find((c) => {
        if (!c.phone) return false;
        const existingE164 = toE164(c.phone);
        return existingE164 && existingE164 === e164Phone;
      });
      if (phoneMatch) {
        return NextResponse.json(
          { success: false, message: 'A customer with this phone already exists' },
          { status: 400 }
        );
      }
    }

    // Prepare final updates: trim name, save phone as E.164
    const finalUpdates = { ...updates };
    if (finalUpdates.name) {
      finalUpdates.name = String(finalUpdates.name).trim();
    }
    if (updates.phone !== undefined) {
      finalUpdates.phone = e164Phone;
    }

    // Update in Supabase (same source as create API) — scoped to this user
    const { data: updated, error: updateError } = await supabaseServer
      .from('customers')
      .update(finalUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update customer error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update customer' },
        { status: 500 }
      );
    }

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Customer profile updated successfully',
      data: updated
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
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