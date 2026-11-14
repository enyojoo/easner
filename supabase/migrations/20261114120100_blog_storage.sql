-- Storage bucket `blog` (plan §5): public read, member write.
-- Paths: posts/{post_id}/…, authors/…, categories/…, media/…
-- Public read needs no policy: a public bucket serves /storage/v1/object/public/blog/… to anyone.
-- SVG is not accepted (script in a public bucket on our domain's CDN).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog', 'blog', true, 20971520,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Blog members list blog files" on storage.objects
  for select to authenticated
  using (bucket_id = 'blog' and public.is_admin_member());

create policy "Blog members upload blog files" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'blog'
    and public.is_admin_member()
    and (storage.foldername(name))[1] in ('posts', 'authors', 'categories', 'media')
  );

create policy "Blog editors and the uploader replace blog files" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog' and (public.is_blog_editor() or (public.is_admin_member() and owner_id = auth.uid()::text)))
  with check (
    bucket_id = 'blog'
    and (public.is_blog_editor() or (public.is_admin_member() and owner_id = auth.uid()::text))
    and (storage.foldername(name))[1] in ('posts', 'authors', 'categories', 'media')
  );

create policy "Blog editors and the uploader delete blog files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog' and (public.is_blog_editor() or (public.is_admin_member() and owner_id = auth.uid()::text)));
