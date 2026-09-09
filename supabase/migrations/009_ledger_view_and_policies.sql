create or replace view app.ledger_entries
with (security_invoker = true)
as
select
  i.id as entry_id,
  i.user_id,
  i.customer_id,
  i.id as source_id,
  'income'::text as source_table,
  'income'::text as entry_type,
  i.amount,
  i.currency,
  i.base_amount,
  i.base_currency,
  i.income_date as entry_date,
  i.category_id,
  i.description,
  i.created_at
from app.income i

union all

select
  e.id as entry_id,
  e.user_id,
  null::uuid as customer_id,
  e.id as source_id,
  'expenses'::text as source_table,
  'expense'::text as entry_type,
  e.amount,
  e.currency,
  e.base_amount,
  e.base_currency,
  e.expense_date as entry_date,
  e.category_id,
  e.description,
  e.created_at
from app.expenses e;