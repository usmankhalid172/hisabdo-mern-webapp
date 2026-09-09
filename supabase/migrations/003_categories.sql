create table if not exists app.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type app.category_type not null default 'both',
  icon text,
  color text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (user_id, name, type),
  unique (user_id, id)
);

create index if not exists categories_user_type_idx
on app.categories (user_id, type);