-- An author's public page shows once the profile is set up (a title and a photo), or they have a live post.
-- Before: only authors with at least one live post were public, so a new team member's page 404'd until their first post.
-- Still hidden: members and guests whose profile is blank (no title or no photo), so the public never sees empty pages.
drop policy if exists "Anyone reads authors with a live post" on public.blog_authors;
drop policy if exists "Anyone reads listed authors" on public.blog_authors;
create policy "Anyone reads listed authors" on public.blog_authors
  for select to anon
  using (
    public.blog_author_has_live_post(id)
    or (coalesce(btrim(title), '') <> '' and avatar_path is not null)
  );
