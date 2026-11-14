-- Every team member gets an author profile the first time they sign in, so "My profile" always has a row to edit and
-- a new Writer (or the Owner) has a byline. Guest authors still exist: editors insert them with member_id null.
--
-- The public side is unchanged: anon only sees authors with at least one live post (policy "Anyone reads authors with
-- a live post"), so an empty profile stays invisible.

-- Unique author slug from a name: lower-case words joined by hyphens, then -2, -3 on collision.
create function public.blog_unique_author_slug(p_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  base text := trim(both '-' from regexp_replace(lower(coalesce(p_name, '')), '[^a-z0-9]+', '-', 'g'));
  candidate text;
  n integer := 1;
begin
  if base = '' then
    base := 'author';
  end if;
  base := left(base, 100);
  candidate := base;
  while exists (select 1 from public.blog_authors a where a.slug = candidate)
        or not public.blog_slug_format_ok(candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  return candidate;
end
$$;

revoke execute on function public.blog_unique_author_slug(text) from public, anon, authenticated;

-- Creates the author row for a member when there is none. Name from the member's name, else the email's local part.
create function public.blog_create_member_author(p_user_id uuid)
returns public.blog_authors
language plpgsql
security definer
set search_path = ''
as $$
declare
  member public.admin_members;
  author public.blog_authors;
  display text;
begin
  select * into author from public.blog_authors a where a.member_id = p_user_id;
  if found then
    return author;
  end if;
  select * into member from public.admin_members m where m.user_id = p_user_id;
  if not found then
    return null;
  end if;
  display := coalesce(nullif(btrim(member.name), ''), split_part(member.email, '@', 1));
  insert into public.blog_authors (slug, name, member_id)
  values (public.blog_unique_author_slug(display), left(display, 120), p_user_id)
  returning * into author;
  return author;
end
$$;

revoke execute on function public.blog_create_member_author(uuid) from public, anon, authenticated;

-- Same as before, plus the author row in the same transaction as the membership.
create or replace function public.accept_admin_invite()
returns public.admin_role
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  user_email text;
  invite public.admin_invites;
  existing public.admin_role;
begin
  if uid is null then
    return null;
  end if;
  select m.role into existing from public.admin_members m where m.user_id = uid;
  if existing is not null then
    return existing;
  end if;

  select lower(u.email) into user_email
  from auth.users u
  where u.id = uid and u.email_confirmed_at is not null;
  if user_email is null then
    return null;
  end if;

  select * into invite from public.admin_invites i
  where i.email = user_email and i.accepted_at is null and i.revoked_at is null
  order by i.created_at desc
  limit 1
  for update;
  if not found then
    return null;
  end if;

  insert into public.admin_members (user_id, role, name, email, invited_by)
  values (uid, invite.role, invite.name, user_email, invite.invited_by);

  perform public.blog_create_member_author(uid);

  update public.admin_invites set accepted_at = now(), accepted_by = uid where id = invite.id;

  return invite.role;
end
$$;

-- ensure_my_author stays as the safety net (and the route "My profile" uses), now through the same helper.
create or replace function public.ensure_my_author()
returns public.blog_authors
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin_member() then
    raise exception 'Not allowed.' using errcode = 'insufficient_privilege';
  end if;
  return public.blog_create_member_author(auth.uid());
end
$$;

-- Backfill: members who signed in before this existed. Safe to run again.
do $$
declare
  m record;
begin
  for m in
    select user_id from public.admin_members x
    where not exists (select 1 from public.blog_authors a where a.member_id = x.user_id)
    order by created_at
  loop
    perform public.blog_create_member_author(m.user_id);
  end loop;
end
$$;
