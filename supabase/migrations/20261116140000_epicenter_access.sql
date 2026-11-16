-- Epicenter access lives beside the website admin, in the same Supabase project.
-- Blog membership stays on admin_invites / admin_members. Epicenter never calls accept_admin_invite.

create type public.epicenter_level as enum ('None', 'Viewer', 'Contributor', 'Admin');
create type public.epicenter_module as enum (
  'Epicenter CRM', 'Epicenter People', 'Ask Easner', 'Shared Intelligence', 'Access Control'
);
create type public.epicenter_status as enum ('Active', 'Disabled');

create table public.epicenter_members (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '' check (char_length(name) <= 120),
  email text not null check (email = lower(email)),
  phone text not null default '',
  address text not null default '',
  status public.epicenter_status not null default 'Active',
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.epicenter_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null check (email = lower(email) and email ~ '^[^@\s]+@easner\.com$'),
  name text not null default '' check (char_length(name) <= 120),
  levels jsonb not null default '{}'::jsonb,
  invited_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz
);

create unique index epicenter_invites_one_pending_per_email
  on public.epicenter_invites (email)
  where accepted_at is null and revoked_at is null;

create table public.epicenter_access (
  user_id uuid not null references public.epicenter_members (user_id) on delete cascade,
  module public.epicenter_module not null,
  level public.epicenter_level not null,
  primary key (user_id, module)
);

create table public.epicenter_activity (
  id bigint generated always as identity primary key,
  actor uuid references auth.users (id) on delete set null,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.epicenter_members enable row level security;
alter table public.epicenter_invites enable row level security;
alter table public.epicenter_access enable row level security;
alter table public.epicenter_activity enable row level security;

create or replace function public.accept_epicenter_invite()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  invite public.epicenter_invites;
  module_name text;
  module_level text;
begin
  if uid is null then
    return false;
  end if;
  if exists (select 1 from public.epicenter_members m where m.user_id = uid) then
    return true;
  end if;
  select lower(u.email) into user_email from auth.users u where u.id = uid and u.email_confirmed_at is not null;
  if user_email is null then
    return false;
  end if;
  select * into invite from public.epicenter_invites i
  where i.email = user_email and i.accepted_at is null and i.revoked_at is null
  order by i.created_at desc
  limit 1
  for update;
  if not found then
    return false;
  end if;
  insert into public.epicenter_members (user_id, name, email, invited_by)
  values (uid, invite.name, user_email, invite.invited_by);
  for module_name, module_level in
    select key, value from jsonb_each_text(invite.levels)
  loop
    insert into public.epicenter_access (user_id, module, level)
    values (uid, module_name::public.epicenter_module, module_level::public.epicenter_level);
  end loop;
  update public.epicenter_invites set accepted_at = now(), accepted_by = uid where id = invite.id;
  insert into public.epicenter_activity (actor, action, detail) values (uid, 'Registered', user_email);
  return true;
end
$$;

revoke all on function public.accept_epicenter_invite() from public;
grant execute on function public.accept_epicenter_invite() to authenticated;

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
  if user_email <> '' and (
    exists (
      select 1 from public.admin_invites i
      where i.email = user_email and i.accepted_at is null and i.revoked_at is null
    )
    or exists (
      select 1 from public.epicenter_invites i
      where i.email = user_email and i.accepted_at is null and i.revoked_at is null
    )
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403,
    'message', 'This email doesn''t have access to Easner.'));
end
$$;

insert into public.epicenter_invites (email, name, levels)
select 'enyo@easner.com', 'Enyo Sam', '{
  "Epicenter CRM": "Admin",
  "Epicenter People": "Admin",
  "Ask Easner": "Admin",
  "Shared Intelligence": "Admin",
  "Access Control": "Admin"
}'::jsonb
where not exists (
  select 1 from public.epicenter_invites i
  where i.email = 'enyo@easner.com' and i.accepted_at is null and i.revoked_at is null
);
