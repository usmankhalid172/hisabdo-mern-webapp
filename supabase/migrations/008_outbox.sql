create table if not exists app.outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
 
  table_name text not null check (
    table_name in (
      'customers',
      'income',
      'expenses',
      'attachments'
    )
  ),
 
  record_id uuid,
  client_uuid uuid,
  action app.outbox_action not null,
  payload jsonb not null default '{}'::jsonb,
 
  status app.outbox_status not null default 'pending',
  retry_count integer not null default 0,
  error_message text,
 
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
 
create index if not exists outbox_pending_idx
on app.outbox (user_id, status, created_at);