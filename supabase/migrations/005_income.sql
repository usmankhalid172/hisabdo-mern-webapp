create table if not exists app.income (
  id uuid primary key default gen_random_uuid(),
  client_uuid uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_id uuid,
  category_id uuid,

  amount numeric(14, 2) not null check (amount > 0),
  currency app.currency_code not null default 'PKR',
  exchange_rate numeric(18, 8) not null default 1,
  base_amount numeric(14, 2) not null check (base_amount > 0),
  base_currency app.currency_code not null default 'PKR',

  income_date date not null default current_date,
  description text,
  payment_method app.payment_method not null default 'cash',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, client_uuid),
  unique (user_id, id),

  foreign key (user_id, customer_id)
    references app.customers (user_id, id)
    on delete set null (customer_id),

  foreign key (user_id, category_id)
    references app.categories (user_id, id)
    on delete set null (category_id)
);

create index if not exists income_user_date_idx
on app.income (user_id, income_date desc);

create index if not exists income_customer_date_idx
on app.income (user_id, customer_id, income_date desc);

create index if not exists income_category_date_idx
on app.income (user_id, category_id, income_date desc);