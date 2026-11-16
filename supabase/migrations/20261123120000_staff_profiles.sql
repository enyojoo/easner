-- One employee photo for every internal app on this database.
-- The picture is still uploaded on the blog author. When that author is a member, this copies the path
-- onto staff_profiles, keyed by the login, so Epicenter and later apps do not read the blog table.

create table public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  avatar_path text,
  updated_at timestamptz not null default now()
);

alter table public.staff_profiles enable row level security;

create policy staff_profiles_read_staff
  on public.staff_profiles
  for select
  to authenticated
  using (
    exists (select 1 from public.admin_members m where m.user_id = (select auth.uid()))
    or exists (select 1 from public.epicenter_members m where m.user_id = (select auth.uid()) and m.status = 'Active')
  );

create or replace function public.sync_staff_profile_from_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.member_id is not null then
    insert into public.staff_profiles (user_id, avatar_path)
    values (new.member_id, new.avatar_path)
    on conflict (user_id) do update
      set avatar_path = excluded.avatar_path,
          updated_at = now();
  end if;
  return new;
end;
$$;

create trigger blog_authors_sync_staff_profile
  after insert or update of avatar_path, member_id
  on public.blog_authors
  for each row
  execute function public.sync_staff_profile_from_author();

insert into public.staff_profiles (user_id, avatar_path)
select member_id, avatar_path
from public.blog_authors
where member_id is not null
on conflict (user_id) do update
  set avatar_path = excluded.avatar_path,
      updated_at = now();
