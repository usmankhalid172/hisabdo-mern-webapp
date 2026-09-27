-- 011_ledger_transactions.sql

CREATE TABLE IF NOT EXISTS app.ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_uuid uuid NOT NULL,
  user_id uuid NOT NULL,
  customer_id uuid NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  category text NULL,
  date date NOT NULL,
  note text NULL,
  image_path text NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  version integer DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL,
  CONSTRAINT ledger_transactions_client_unique UNIQUE (user_id, client_uuid),
  CONSTRAINT fk_ledger_transaction_customer FOREIGN KEY (customer_id) REFERENCES app.customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ledger_transactions_user_date ON app.ledger_transactions (user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_user_updated_at ON app.ledger_transactions (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_active ON app.ledger_transactions (user_id, id) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_ledger_transactions_set_updated_at
BEFORE UPDATE ON app.ledger_transactions
FOR EACH ROW
EXECUTE FUNCTION app.set_updated_at();
