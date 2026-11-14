-- The five default categories (plan §3, final per §8 decision 5). Editable afterwards in the admin.

insert into public.blog_categories (slug, name, description, sort_order) values
  ('product-updates', 'Product updates', 'Launches, new features and what changed in Easner.', 10),
  ('business', 'Business', 'Guides for companies: getting paid, paying suppliers and contractors, payroll and checkout.', 20),
  ('personal', 'Personal', 'Guides for people: sending home, getting paid from abroad, holding USD and EUR, and cards.', 30),
  ('global-money', 'Global money', 'How cross-border money actually moves: corridors, stablecoins and FX, explained.', 40),
  ('company', 'Company', 'News from Easner: the team, partnerships and milestones.', 50)
on conflict (slug) do nothing;
