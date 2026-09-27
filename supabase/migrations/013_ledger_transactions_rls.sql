-- 013_ledger_transactions_rls.sql

ALTER TABLE app.ledger_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ledger_transactions_select ON app.ledger_transactions
  FOR SELECT
  USING (user_id = app.current_user_id() OR current_setting('request.jwt.claims.role', true) = 'service_role');

CREATE POLICY ledger_transactions_insert ON app.ledger_transactions
  FOR INSERT
  WITH CHECK (user_id = app.current_user_id() OR current_setting('request.jwt.claims.role', true) = 'service_role');

CREATE POLICY ledger_transactions_update ON app.ledger_transactions
  FOR UPDATE
  USING (user_id = app.current_user_id() OR current_setting('request.jwt.claims.role', true) = 'service_role')
  WITH CHECK (user_id = app.current_user_id() OR current_setting('request.jwt.claims.role', true) = 'service_role');

CREATE POLICY ledger_transactions_delete ON app.ledger_transactions
  FOR DELETE
  USING (user_id = app.current_user_id() OR current_setting('request.jwt.claims.role', true) = 'service_role');