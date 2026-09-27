-- 015_subscription_records.sql
-- Add an authenticated-user subscription ledger for Google Play purchase tracking.
-- This table is additive, account-scoped, and deliberately not used as the source of truth
-- for entitlement. Google Play validation remains authoritative for actual Pro status.

CREATE TABLE IF NOT EXISTS app.subscription_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'google_play',
  product_id text NOT NULL,
  base_plan_id text NOT NULL,
  purchase_token text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  purchased_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NULL,
  auto_renewing boolean NOT NULL DEFAULT true,
  last_verified_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_records_purchase_unique UNIQUE (user_id, purchase_token),
  CONSTRAINT subscription_records_active_status_check CHECK (
    status IN ('active', 'expired', 'cancelled', 'pending', 'error', 'revoked')
  )
);

CREATE INDEX IF NOT EXISTS idx_subscription_records_user_id
  ON app.subscription_records (user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_records_product_id
  ON app.subscription_records (product_id);

CREATE INDEX IF NOT EXISTS idx_subscription_records_status
  ON app.subscription_records (status, user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_records_expires_at
  ON app.subscription_records (expires_at);

CREATE TRIGGER trg_subscription_records_set_updated_at
BEFORE UPDATE ON app.subscription_records
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.subscription_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_records_select ON app.subscription_records
  FOR SELECT
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscription_records_insert ON app.subscription_records
  FOR INSERT
  WITH CHECK (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscription_records_update ON app.subscription_records
  FOR UPDATE
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  )
  WITH CHECK (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscription_records_delete ON app.subscription_records
  FOR DELETE
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );
