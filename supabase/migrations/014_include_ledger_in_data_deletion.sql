-- 014_include_ledger_in_data_deletion.sql
-- Additive replacement for the already-deployed delete-all function.

CREATE OR REPLACE FUNCTION app.delete_all_user_data()
RETURNS void AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM app.ledger_transactions WHERE user_id = uid;
  DELETE FROM app.income WHERE user_id = uid;
  DELETE FROM app.expenses WHERE user_id = uid;
  DELETE FROM app.customers WHERE user_id = uid;
  DELETE FROM app.attachments WHERE user_id = uid;
  DELETE FROM app.categories WHERE user_id = uid;
  DELETE FROM app.user_profiles WHERE user_id = uid;
  DELETE FROM app.outbox WHERE user_id = uid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;