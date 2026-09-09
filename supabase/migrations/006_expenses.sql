create table if not exists app.expenses (
  id uuid primary key default gen_random_uuid(),
  client_uuid uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid,
 
  amount numeric(14, 2) not null check (amount > 0),
  currency app.currency_code not null default 'PKR',
  exchange_rate numeric(18, 8) not null default 1,
  base_amount numeric(14, 2) not null check (base_amount > 0),
  base_currency app.currency_code not null default 'PKR',
 
  expense_date date not null default current_date,
  description text,
  payment_method app.payment_method not null default 'cash',
 
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
 
  unique (user_id, client_uuid),
  unique (user_id, id),
 
  foreign key (user_id, category_id)
    references app.categories (user_id, id)
    on delete set null (category_id)
);
 
create index if not exists expenses_user_date_idx
on app.expenses (user_id, expense_date desc);
 
create index if not exists expenses_category_date_idx
on app.expenses (user_id, category_id, expense_date desc);