create table if not exists app.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  business_name text,
  default_currency app.currency_code not null default 'PKR',
  timezone text not null default 'Asia/Karachi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_profiles_email_idx
on app.user_profiles (lower(email));