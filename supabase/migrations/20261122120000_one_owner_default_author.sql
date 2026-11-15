-- 1. There is one owner. Everyone else is an editor or a writer.
--    A second owner member is impossible (unique index), and an owner invite is refused while an owner exists or
--    another owner invite is pending. The first owner is still created by the bootstrap invite (no owner yet).
create unique index if not exists admin_members_one_owner on public.admin_members ((true)) where role = 'owner';

create or replace function public.admin_invites_one_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'owner' and new.accepted_at is null and new.revoked_at is null and (
    exists (select 1 from public.admin_members m where m.role = 'owner')
    or exists (
      select 1 from public.admin_invites i
      where i.role = 'owner' and i.accepted_at is null and i.revoked_at is null and i.id is distinct from new.id
    )
  ) then
    raise exception 'There is one owner. Invite people as an editor or a writer.' using errcode = 'check_violation';
  end if;
  return new;
end
$$;

drop trigger if exists admin_invites_one_owner on public.admin_invites;
create trigger admin_invites_one_owner before insert or update of role, accepted_at, revoked_at on public.admin_invites
  for each row execute function public.admin_invites_one_owner();

-- 2. A new post starts with its creator's author profile attached, so nobody has to tick themselves.
create or replace function public.blog_posts_default_author()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.blog_post_authors (post_id, author_id, position)
  select new.id, a.id, 0
  from public.blog_authors a
  where a.member_id = coalesce(new.created_by, auth.uid())
  on conflict do nothing;
  return new;
end
$$;

drop trigger if exists blog_posts_default_author on public.blog_posts;
create trigger blog_posts_default_author after insert on public.blog_posts
  for each row execute function public.blog_posts_default_author();

-- Backfill: drafts that have no author yet get their creator's profile.
insert into public.blog_post_authors (post_id, author_id, position)
select p.id, a.id, 0
from public.blog_posts p
join public.blog_authors a on a.member_id = p.created_by
where p.status in ('draft', 'changes_requested', 'in_review')
  and not exists (select 1 from public.blog_post_authors x where x.post_id = p.id)
on conflict do nothing;
