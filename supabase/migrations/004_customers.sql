create table if not exists app.customers (
  id uuid primary key default gen_random_uuid(),
  client_uuid uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  address text,
  opening_balance numeric(14, 2) not null default 0,
  currency app.currency_code not null default 'PKR',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, client_uuid),
  unique (user_id, id)
);

create index if not exists customers_user_updated_idx
on app.customers (user_id, updated_at desc);

create index if not exists customers_user_name_idx
on app.customers (user_id, lower(name));

create index if not exists customers_user_phone_idx
on app.customers (user_id, phone);