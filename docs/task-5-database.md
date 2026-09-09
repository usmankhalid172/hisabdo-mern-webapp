# HisabDo Task 5 — Database Design

## Database direction

This task follows the Supabase/PostgreSQL structure shown in the FlutterFlow
reference flow. The `app` schema is the source of truth for user-owned
accounting data.

## Tables

- `app.user_profiles` — profile data linked to `auth.users`
- `app.categories` — user-owned income and expense categories
- `app.customers` — customer records and opening balances
- `app.income` — income transactions
- `app.expenses` — expense transactions
- `app.attachments` — receipt/file metadata
- `app.outbox` — offline-first create/update/delete queue
- `app.ledger_entries` — read-only union view over income and expenses
- `app.transactions` — compatibility read view for existing transaction screens
- Auth trigger — automatically creates `user_profiles` and default categories for
  newly registered Supabase users

## Ownership and security

Every user-owned table contains `user_id`. RLS policies only allow the
authenticated user to read or mutate rows where `user_id = auth.uid()`.

Composite ownership-aware foreign keys prevent one user from referencing
another user's customers or categories.

## Currency model

Income and expense records store:

- `amount` and original `currency`
- `exchange_rate`
- converted `base_amount`
- `base_currency`

Supported currencies are:

- PKR
- USD
- INR

## Ledger behavior

Income records are written to `app.income`.

Expense records are written to `app.expenses`.

The following views combine income and expense records for reporting:

- `app.ledger_entries`
- `app.transactions`

These views are read-only and should not be used as direct insert targets.

## Applying migrations

Run the SQL migration files in this exact order:

1. `001_extensions_and_types.sql`
2. `002_user_profiles.sql`
3. `003_categories.sql`
4. `004_customers.sql`
5. `005_income.sql`
6. `006_expenses.sql`
7. `007_attachments.sql`
8. `008_outbox.sql`
9. `009_ledger_view_and_policies.sql`
10. `010_user_data_functions.sql`
11. `011_auth_profile_trigger.sql`

The migrations were validated against a local PostgreSQL instance.

## Task 5 completion

Task 5 includes:

- Supabase/PostgreSQL database structure
- User profiles
- Customers
- Income and expenses
- Multi-currency support
- Categories
- Attachments
- Offline sync outbox
- Ledger view
- Transaction compatibility view
- Row Level Security policies
- User ownership
- Database indexes
- User data deletion function