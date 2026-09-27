-- 017_public_schema_grants_and_views.sql
-- Grants permissions on 'app' schema and creates public views so that standard web/API queries succeed seamlessly.

-- 1. Grant usage on schema 'app' to PostgREST API roles
GRANT USAGE ON SCHEMA app TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA app TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA app TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA app TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA app GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Create public views that mirror the app schema tables with security invoker
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

-- 3. Grant access on public views to API roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ledger_transactions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_records TO anon, authenticated, service_role;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
