-- 017_public_schema_grants_and_views.sql
-- Restores required database access on schema 'app' with strict Row Level Security (RLS)
-- and provides public views with security_invoker = true for seamless PostgREST querying.

-- ========================================================
-- 1. Schema Grants
-- ========================================================
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;

-- ========================================================
-- 2. Enable Row Level Security (RLS) on all user-owned tables
-- ========================================================
ALTER TABLE app.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.outbox ENABLE ROW LEVEL SECURITY;

-- ========================================================
-- 3. Row Level Security Policies for Authenticated Users
-- Ensure records remain strictly isolated to the authenticated user.
-- ========================================================

-- app.user_profiles policies
DROP POLICY IF EXISTS user_profiles_select ON app.user_profiles;
CREATE POLICY user_profiles_select ON app.user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_insert ON app.user_profiles;
CREATE POLICY user_profiles_insert ON app.user_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_update ON app.user_profiles;
CREATE POLICY user_profiles_update ON app.user_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS user_profiles_delete ON app.user_profiles;
CREATE POLICY user_profiles_delete ON app.user_profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- app.categories policies
DROP POLICY IF EXISTS categories_select ON app.categories;
CREATE POLICY categories_select ON app.categories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS categories_insert ON app.categories;
CREATE POLICY categories_insert ON app.categories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS categories_update ON app.categories;
CREATE POLICY categories_update ON app.categories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS categories_delete ON app.categories;
CREATE POLICY categories_delete ON app.categories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- app.customers policies
DROP POLICY IF EXISTS customers_select ON app.customers;
CREATE POLICY customers_select ON app.customers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS customers_insert ON app.customers;
CREATE POLICY customers_insert ON app.customers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS customers_update ON app.customers;
CREATE POLICY customers_update ON app.customers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS customers_delete ON app.customers;
CREATE POLICY customers_delete ON app.customers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- app.income policies
DROP POLICY IF EXISTS income_select ON app.income;
CREATE POLICY income_select ON app.income
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS income_insert ON app.income;
CREATE POLICY income_insert ON app.income
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS income_update ON app.income;
CREATE POLICY income_update ON app.income
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS income_delete ON app.income;
CREATE POLICY income_delete ON app.income
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- app.expenses policies
DROP POLICY IF EXISTS expenses_select ON app.expenses;
CREATE POLICY expenses_select ON app.expenses
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS expenses_insert ON app.expenses;
CREATE POLICY expenses_insert ON app.expenses
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS expenses_update ON app.expenses;
CREATE POLICY expenses_update ON app.expenses
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS expenses_delete ON app.expenses;
CREATE POLICY expenses_delete ON app.expenses
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- app.attachments policies
DROP POLICY IF EXISTS attachments_select ON app.attachments;
CREATE POLICY attachments_select ON app.attachments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS attachments_insert ON app.attachments;
CREATE POLICY attachments_insert ON app.attachments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS attachments_update ON app.attachments;
CREATE POLICY attachments_update ON app.attachments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS attachments_delete ON app.attachments;
CREATE POLICY attachments_delete ON app.attachments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- app.outbox policies
DROP POLICY IF EXISTS outbox_select ON app.outbox;
CREATE POLICY outbox_select ON app.outbox
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS outbox_insert ON app.outbox;
CREATE POLICY outbox_insert ON app.outbox
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS outbox_update ON app.outbox;
CREATE POLICY outbox_update ON app.outbox
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS outbox_delete ON app.outbox;
CREATE POLICY outbox_delete ON app.outbox
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ========================================================
-- 4. Table & Sequence Grants
-- ========================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA app TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO authenticated, service_role;
GRANT EXECUTE ON ALL ROUTINES IN SCHEMA app TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT EXECUTE ON ROUTINES TO authenticated, service_role;

-- ========================================================
-- 5. Public Views for Compatibility (security_invoker = true)
-- ========================================================
CREATE OR REPLACE VIEW public.customers WITH (security_invoker = true) AS
  SELECT * FROM app.customers;

CREATE OR REPLACE VIEW public.income WITH (security_invoker = true) AS
  SELECT * FROM app.income;

CREATE OR REPLACE VIEW public.expenses WITH (security_invoker = true) AS
  SELECT * FROM app.expenses;

CREATE OR REPLACE VIEW public.ledger_transactions WITH (security_invoker = true) AS
  SELECT * FROM app.ledger_transactions;

CREATE OR REPLACE VIEW public.subscription_records WITH (security_invoker = true) AS
  SELECT * FROM app.subscription_records;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_transactions TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_records TO authenticated, service_role;

-- ========================================================
-- 6. Reload PostgREST Schema Cache
-- ========================================================
NOTIFY pgrst, 'reload schema';
