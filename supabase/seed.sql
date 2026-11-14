-- Local development only (`supabase db reset`). Never applied to the hosted project.
-- The default categories live in a migration, so production gets them too.

-- A local owner to sign in with. Request a code for this address on http://localhost:3010/auth/login and read it
-- in Mailpit (http://127.0.0.1:54324). The invite becomes membership on first sign-in.
insert into public.admin_invites (email, role, name)
values ('owner@easner.test', 'owner', 'Local owner')
on conflict do nothing;
