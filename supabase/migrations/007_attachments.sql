create table if not exists app.attachments (
  id uuid primary key default gen_random_uuid(),
  client_uuid uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  income_id uuid,
  expense_id uuid,

  file_name text not null,
  file_type text,
  file_size bigint,
  storage_path text not null,

  created_at timestamptz not null default now(),

  check (
    (income_id is not null and expense_id is null)
    or
    (income_id is null and expense_id is not null)
  ),

  unique (user_id, client_uuid),

  foreign key (user_id, income_id)
    references app.income (user_id, id)
    on delete cascade,

  foreign key (user_id, expense_id)
    references app.expenses (user_id, id)
    on delete cascade
);