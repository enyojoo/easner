-- Rename the product in the sign-in refusal message: "Easner Website Admin". Same logic as before.
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  user_email text := lower(coalesce(event -> 'user' ->> 'email', ''));
begin
  if user_email <> '' and exists (
    select 1 from public.admin_invites i
    where i.email = user_email and i.accepted_at is null and i.revoked_at is null
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email doesn''t have access to Easner Website Admin.'));
end
$$;
