create or replace function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = app, public
as $$
begin
  insert into app.user_profiles (
    id,
    email,
    full_name,
    phone,
    business_name
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'business_name'
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function app.handle_new_auth_user();