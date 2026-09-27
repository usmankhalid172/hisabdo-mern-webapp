-- 016_subscription_ownership.sql
-- Canonical ownership table for Google Play subscriptions.
-- This migration resolves the older 015 prototype model and promotes the authoritative
-- app.subscriptions table for user-linked entitlement ownership.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'subscription_records'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'app' AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE app.subscription_records RENAME TO subscriptions;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS app.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  base_plan_id text NOT NULL,
  purchase_token text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  purchase_start_at timestamptz NOT NULL DEFAULT now(),
  expiry_at timestamptz NULL,
  auto_renewing boolean NOT NULL DEFAULT true,
  last_verified_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_valid_status CHECK (
    status IN ('active', 'pending', 'cancelled', 'expired', 'revoked', 'paused', 'refunded')
  ),
  CONSTRAINT subscriptions_unique_purchase_token UNIQUE (purchase_token),
  CONSTRAINT subscriptions_unique_user_purchase UNIQUE (user_id, purchase_token)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'app' AND table_name = 'subscriptions' AND column_name = 'purchased_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'app' AND table_name = 'subscriptions' AND column_name = 'purchase_start_at'
  ) THEN
    ALTER TABLE app.subscriptions RENAME COLUMN purchased_at TO purchase_start_at;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'app' AND table_name = 'subscriptions' AND column_name = 'expires_at'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'app' AND table_name = 'subscriptions' AND column_name = 'expiry_at'
  ) THEN
    ALTER TABLE app.subscriptions RENAME COLUMN expires_at TO expiry_at;
  END IF;
END $$;

ALTER TABLE app.subscriptions
  ALTER COLUMN purchase_start_at SET DEFAULT now(),
  ALTER COLUMN status SET DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON app.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status_user_id
  ON app.subscriptions (status, user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_purchase_token
  ON app.subscriptions (purchase_token);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry_at
  ON app.subscriptions (expiry_at);

CREATE TRIGGER trg_subscriptions_set_updated_at
BEFORE UPDATE ON app.subscriptions
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();

ALTER TABLE app.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_own
  ON app.subscriptions
  FOR SELECT
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscriptions_insert_own
  ON app.subscriptions
  FOR INSERT
  WITH CHECK (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscriptions_update_own
  ON app.subscriptions
  FOR UPDATE
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  )
  WITH CHECK (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

CREATE POLICY subscriptions_delete_own
  ON app.subscriptions
  FOR DELETE
  USING (
    user_id = app.current_user_id()
    OR current_setting('request.jwt.claims.role', true) = 'service_role'
  );

-- The client must never be able to create/modify ownership rows directly.
-- Only the authenticated Edge Function / service role performs verified ownership writes.
