create or replace function app.delete_all_user_data()
returns void
language plpgsql
security definer
set search_path = app, public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication is required';
  end if;

  delete from app.outbox
  where user_id = current_user_id;

  delete from app.attachments
  where user_id = current_user_id;

  delete from app.expenses
  where user_id = current_user_id;

  delete from app.income
  where user_id = current_user_id;

  delete from app.customers
  where user_id = current_user_id;

  delete from app.categories
  where user_id = current_user_id;

  delete from app.user_profiles
  where id = current_user_id;
end;
$$;

grant execute on function app.delete_all_user_data()
to authenticated;