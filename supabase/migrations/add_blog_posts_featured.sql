-- Add featured column to blog_posts for highlighting posts in the featured block
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
