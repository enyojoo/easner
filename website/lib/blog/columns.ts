/**
 * Explicit column lists for the anon key. These are exactly the columns granted in supabase/README.md; anything else
 * (draft_content, audit and lock fields) is rejected by PostgREST. Never use `*`.
 */

export const POST_LIST_COLUMNS = [
  "id", "slug", "title", "excerpt", "summary", "cover_path", "cover_alt", "cover_focal_point", "og_image_path",
  "category_id", "product_page", "featured", "featured_rank", "seo_title", "seo_description", "canonical_url", "noindex",
  "focus_keyword", "word_count", "reading_minutes", "published_at", "content_modified_at",
].join(",")

export const POST_BODY_COLUMNS = `${POST_LIST_COLUMNS},content,content_text`

export const CATEGORY_COLUMNS = "id,slug,name,description,intro,og_art_path,sort_order,seo_title,seo_description"

export const AUTHOR_COLUMNS =
  "id,slug,name,title,location,avatar_path,bio,x_url,linkedin_url,github_url,website_url"

/** Embeds, by foreign key, as in supabase/README.md. */
export const POST_EMBEDS = `blog_categories(id,slug,name),blog_post_authors(position,blog_authors(${AUTHOR_COLUMNS}))`
