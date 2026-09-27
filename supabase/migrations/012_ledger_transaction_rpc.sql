-- 012_ledger_transaction_rpc.sql

CREATE OR REPLACE FUNCTION app.upsert_ledger_transactions(records jsonb)
RETURNS TABLE(id uuid, client_uuid uuid, updated_at timestamptz) AS $$
DECLARE
  item jsonb;
  referenced_customer uuid;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements(records) LOOP
    referenced_customer := NULLIF(item->>'customer_client_uuid', '')::uuid;
    IF (referenced_customer IS NOT NULL OR NULLIF(item->>'customer_remote_id', '') IS NOT NULL)
      AND NOT EXISTS (
      SELECT 1 FROM app.customers c
      WHERE c.user_id = auth.uid()
        AND (c.client_uuid = referenced_customer
             OR c.id = NULLIF(item->>'customer_remote_id', '')::uuid)
    ) THEN
      RAISE EXCEPTION 'Referenced customer is not available for this user';
    END IF;
  END LOOP;

  RETURN QUERY
  INSERT INTO app.ledger_transactions AS t (
    client_uuid, user_id, customer_id, amount, type, category, date, note,
    image_path, metadata, version, deleted_at, created_at, updated_at
  )
  SELECT
    (r->>'client_uuid')::uuid,
    auth.uid(),
        CASE WHEN (r->>'customer_client_uuid') IS NULL AND (r->>'customer_remote_id') IS NULL THEN NULL
         ELSE (SELECT c.id FROM app.customers c
               WHERE c.user_id = auth.uid()
            AND (c.client_uuid = NULLIF(r->>'customer_client_uuid', '')::uuid
              OR c.id = NULLIF(r->>'customer_remote_id', '')::uuid)
          LIMIT 1) END,
    (r->>'amount')::numeric,
    r->>'type',
    r->>'category',
    (r->>'date')::date,
    r->>'note',
    r->>'image_path',
    COALESCE(r->'metadata', '{}'::jsonb),
    COALESCE((r->>'version')::int, 1),
    CASE WHEN (r->>'deleted_at') IS NULL OR r->>'deleted_at' = '' THEN NULL
         ELSE (r->>'deleted_at')::timestamptz END,
    now(), now()
  FROM jsonb_array_elements(records) AS r
  ON CONFLICT ON CONSTRAINT ledger_transactions_client_unique DO UPDATE SET
    customer_id = EXCLUDED.customer_id,
    amount      = EXCLUDED.amount,
    type        = EXCLUDED.type,
    category    = EXCLUDED.category,
    date        = EXCLUDED.date,
    note        = EXCLUDED.note,
    image_path  = EXCLUDED.image_path,
    metadata    = EXCLUDED.metadata,
    version     = GREATEST(t.version, EXCLUDED.version),
    deleted_at  = COALESCE(EXCLUDED.deleted_at, t.deleted_at),
    updated_at  = now()
  RETURNING t.id, t.client_uuid, t.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.pull_ledger_transactions(
  since      timestamptz DEFAULT NULL,
  limit_rows int         DEFAULT 1000
)
RETURNS SETOF app.ledger_transactions AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM app.ledger_transactions
  WHERE user_id = auth.uid()
    AND updated_at > COALESCE(since, '1970-01-01'::timestamptz)
  ORDER BY updated_at ASC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.soft_delete_ledger_transaction(p_client_uuid uuid)
RETURNS TABLE(id uuid, client_uuid uuid, deleted_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  UPDATE app.ledger_transactions AS t
  SET deleted_at = now(), updated_at = now()
  WHERE t.user_id = auth.uid()
    AND t.client_uuid = p_client_uuid
  RETURNING t.id, t.client_uuid, t.deleted_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.restore_ledger_transaction(p_client_uuid uuid)
RETURNS TABLE(id uuid, client_uuid uuid, deleted_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  UPDATE app.ledger_transactions AS t
  SET deleted_at = NULL, updated_at = now()
  WHERE t.user_id = auth.uid()
    AND t.client_uuid = p_client_uuid
  RETURNING t.id, t.client_uuid, t.deleted_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.upsert_records(table_name text, records jsonb)
RETURNS jsonb AS $$
DECLARE result jsonb;
BEGIN
  CASE table_name
    WHEN 'ledger_transactions' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_ledger_transactions(records) r;
    WHEN 'customers' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_customers(records) r;
    WHEN 'income' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_income(records) r;
    WHEN 'expenses' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_expenses(records) r;
    WHEN 'attachments' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_attachments(records) r;
    WHEN 'categories' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_categories(records) r;
    WHEN 'user_profiles' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.upsert_user_profiles(records) r;
    ELSE RAISE EXCEPTION 'upsert_records: unsupported table "%"', table_name;
  END CASE;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.pull_changes(table_name text, since timestamptz DEFAULT NULL, limit_rows int DEFAULT 1000)
RETURNS jsonb AS $$
DECLARE result jsonb;
BEGIN
  CASE table_name
    WHEN 'ledger_transactions' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_ledger_transactions(since, limit_rows) r;
    WHEN 'customers' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_customers(since, limit_rows) r;
    WHEN 'income' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_income(since, limit_rows) r;
    WHEN 'expenses' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_expenses(since, limit_rows) r;
    WHEN 'attachments' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_attachments(since, limit_rows) r;
    WHEN 'categories' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_categories(since, limit_rows) r;
    WHEN 'user_profiles' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.pull_user_profiles(since, limit_rows) r;
    ELSE RAISE EXCEPTION 'pull_changes: unsupported table "%"', table_name;
  END CASE;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.soft_delete(table_name text, p_client_uuid uuid)
RETURNS jsonb AS $$
DECLARE result jsonb;
BEGIN
  CASE table_name
    WHEN 'ledger_transactions' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.soft_delete_ledger_transaction(p_client_uuid) r;
    WHEN 'customers' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.soft_delete_customer(p_client_uuid) r;
    WHEN 'income' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.soft_delete_income(p_client_uuid) r;
    WHEN 'expenses' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.soft_delete_expense(p_client_uuid) r;
    WHEN 'categories' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.soft_delete_category(p_client_uuid) r;
    ELSE RAISE EXCEPTION 'soft_delete: unsupported table "%"', table_name;
  END CASE;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION app.restore_record(table_name text, p_client_uuid uuid)
RETURNS jsonb AS $$
DECLARE result jsonb;
BEGIN
  CASE table_name
    WHEN 'ledger_transactions' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.restore_ledger_transaction(p_client_uuid) r;
    WHEN 'customers' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.restore_customer(p_client_uuid) r;
    WHEN 'income' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.restore_income(p_client_uuid) r;
    WHEN 'expenses' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.restore_expense(p_client_uuid) r;
    WHEN 'categories' THEN SELECT jsonb_agg(to_jsonb(r)) INTO result FROM app.restore_category(p_client_uuid) r;
    ELSE RAISE EXCEPTION 'restore_record: unsupported table "%"', table_name;
  END CASE;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;