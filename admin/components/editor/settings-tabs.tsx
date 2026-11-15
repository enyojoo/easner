"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Lock } from "lucide-react"
import {
  PRODUCT_PAGES,
  headings,
  internalLinks,
  externalLinks,
  type DocNode,
  type ProductSlug,
} from "@easner/blog-content"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { EditorSelect } from "@/components/editor/editor-select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CoverField, fileUrl } from "@/components/editor/cover-field"
import type { AuthorOption, CategoryOption, FocalPoint, OtherPost, PostFull, SettingsPatch, Viewer } from "@/components/editor/types"
import {
  EXCERPT_RECOMMENDED_MAX,
  META_DESCRIPTION_RANGE,
  META_TITLE_RANGE,
  finalTitle,
  lengthState,
  serpPreview,
} from "@/lib/blog/serp"
import { deriveFields } from "@/lib/blog/derive"
import { slugLocked, validateSlug } from "@/lib/blog/slug"
import { bioToText } from "@/lib/queries-pages"
import { cn } from "@/lib/utils"

const NONE = "__none"

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-3 border-b border-border px-5 py-5 last:border-b-0">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  )
}

function Counter({ length, range, label }: { length: number; range: readonly [number, number]; label?: string }) {
  const state = lengthState("x".repeat(length), range)
  return (
    <span
      className={cn(
        "text-xs tabular-nums",
        state === "ok" ? "text-success-text" : state === "empty" ? "text-muted-foreground" : "text-warning-text",
      )}
    >
      {length} {label ?? "characters"} · {range[0]}–{range[1]}
    </span>
  )
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
  disabled,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-start justify-between gap-4">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label} />
    </label>
  )
}

export type TabCommon = {
  post: PostFull
  title: string
  excerpt: string
  doc: DocNode
  viewer: Viewer
  readOnly: boolean
  patch: (patch: SettingsPatch) => void
  patchSoon: (patch: SettingsPatch) => void
}

// ---------------------------------------------------------------------------------------------------------------
// Post
// ---------------------------------------------------------------------------------------------------------------

export function PostTab({
  post,
  title,
  excerpt,
  doc,
  viewer,
  readOnly,
  patch,
  patchSoon,
  categories,
  authors,
  onExcerptChange,
  onAuthorsChange,
  significant,
  onSignificantChange,
  onUploadCover,
}: TabCommon & {
  categories: CategoryOption[]
  authors: AuthorOption[]
  onExcerptChange: (value: string) => void
  onAuthorsChange: (ids: string[]) => void
  significant: boolean
  onSignificantChange: (value: boolean) => void
  onUploadCover: (file: File) => Promise<void>
}) {
  const locked = slugLocked({ publishedAt: post.published_at, role: viewer.role, status: post.status })
  const [slugDraft, setSlugDraft] = useState(post.slug)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [syncedSlug, setSyncedSlug] = useState(post.slug)
  if (post.slug !== syncedSlug) {
    // The title can rewrite an automatic slug from outside; follow it.
    setSyncedSlug(post.slug)
    setSlugDraft(post.slug)
  }
  const slugCheck = validateSlug(slugDraft)
  const wasPublished = Boolean(post.published_at)

  const commitSlug = () => {
    if (slugDraft === post.slug || !slugCheck.ok) return
    if (wasPublished) setPendingSlug(slugDraft)
    else patch({ slug: slugDraft })
  }

  const stats = useMemo(
    () => ({
      words: deriveFields(doc).wordCount,
      outline: headings(doc),
      internal: internalLinks(doc).length,
      external: externalLinks(doc).length,
    }),
    [doc],
  )
  const isEditor = viewer.role === "owner" || viewer.role === "editor"
  const selectedAuthors = post.authorIds
  const toggleAuthor = (id: string, on: boolean) =>
    onAuthorsChange(on ? [...selectedAuthors, id] : selectedAuthors.filter((existing) => existing !== id))

  return (
    <div>
      <Section title="URL" hint={locked ? "Locked after the first publish. Only an owner can change it." : "Locks after the first publish. A later change adds a redirect."}>
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">/blog/</span>
            <Input
              aria-label="Post URL"
              className="font-mono text-xs"
              value={slugDraft}
              disabled={locked || readOnly}
              aria-invalid={!slugCheck.ok}
              onChange={(event) => setSlugDraft(event.target.value.toLowerCase())}
              onBlur={commitSlug}
              onKeyDown={(event) => event.key === "Enter" && commitSlug()}
            />
            {locked ? <Lock className="size-4 shrink-0 text-muted-foreground" aria-label="Locked" /> : null}
          </div>
          {!slugCheck.ok ? <p className="text-xs font-medium text-destructive-text">{slugCheck.reason}</p> : null}
        </div>
      </Section>

      <Section title="Category" hint="One category per post. There are no tags.">
        <EditorSelect
          ariaLabel="Category"
          placeholder="Choose a category"
          value={post.category_id ?? NONE}
          disabled={readOnly}
          onValueChange={(value) => patch({ category_id: value === NONE ? null : value })}
          options={[{ value: NONE, label: "No category" }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
        />
      </Section>

      <Section title="Authors" hint="Each author needs a photo, a title and a bio before the post can publish.">
        <ul className="grid gap-1.5">
          {authors.length === 0 ? <li className="text-sm text-muted-foreground">No authors yet. Add one under Authors.</li> : null}
          {authors.map((author) => {
            const gap = !author.avatar_path ? "Missing photo" : !author.title?.trim() ? "Missing title" : !bioToText(author.bio).trim() ? "Missing bio" : null
            return (
              <li key={author.id}>
                <label className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-muted/50">
                  <Checkbox
                    checked={selectedAuthors.includes(author.id)}
                    disabled={readOnly}
                    onCheckedChange={(on) => toggleAuthor(author.id, on === true)}
                    aria-label={author.name}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{author.name}</span>
                    {author.title ? <span className="block truncate text-xs text-muted-foreground">{author.title}</span> : null}
                  </span>
                  {gap ? <span className="shrink-0 rounded-full bg-warning-surface px-2 py-0.5 text-[11px] font-medium text-warning-text">{gap}</span> : null}
                </label>
              </li>
            )
          })}
        </ul>
      </Section>

      <Section title="Product page" hint="The page this post supports. It feeds “Related reading” on that page.">
        <EditorSelect
          ariaLabel="Product page"
          placeholder="None"
          value={post.product_page ?? NONE}
          disabled={readOnly}
          onValueChange={(value) => patch({ product_page: value === NONE ? null : value })}
          options={[
            { value: NONE, label: "None" },
            ...(Object.keys(PRODUCT_PAGES) as ProductSlug[]).map((slug) => ({ value: PRODUCT_PAGES[slug].path, label: PRODUCT_PAGES[slug].label })),
          ]}
        />
      </Section>

      {isEditor ? (
        <Section title="Featured">
          <Toggle label="Feature this post" hint="Shows in the featured block on the blog index." checked={post.featured} disabled={readOnly} onChange={(featured) => patch({ featured })} />
        </Section>
      ) : null}

      <Section title="Cover" hint="Required to publish. The uploaded cover is the share image, full-bleed.">
        <CoverField
          coverPath={post.cover_path}
          coverAlt={post.cover_alt}
          focal={post.cover_focal_point}
          disabled={readOnly}
          onUpload={onUploadCover}
          onAltChange={(cover_alt) => patchSoon({ cover_alt })}
          onFocalChange={(cover_focal_point: FocalPoint) => patchSoon({ cover_focal_point })}
        />
      </Section>

      <Section title="Excerpt" hint="The dek under the title. Used on cards and as the description fallback.">
        <Textarea
          aria-label="Excerpt"
          rows={3}
          value={excerpt}
          disabled={readOnly}
          onChange={(event) => onExcerptChange(event.target.value)}
        />
        <span className={cn("text-xs tabular-nums", excerpt.length > EXCERPT_RECOMMENDED_MAX ? "text-warning-text" : "text-muted-foreground")}>
          {excerpt.length} / {EXCERPT_RECOMMENDED_MAX}
        </span>
      </Section>

      {post.published_at && isEditor ? (
        <Section title="Update">
          <Toggle
            label="This is a significant update"
            hint="Moves the “Updated” date and the sitemap date. Leave off for typo fixes."
            checked={significant}
            onChange={onSignificantChange}
          />
        </Section>
      ) : null}

      <Section title="About this post">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Words</dt>
          <dd className="tabular-nums text-foreground">{stats.words.toLocaleString("en-US")}</dd>
          <dt className="text-muted-foreground">Headings</dt>
          <dd className="tabular-nums text-foreground">{stats.outline.length}</dd>
          <dt className="text-muted-foreground">Internal links</dt>
          <dd className="tabular-nums text-foreground">{stats.internal}</dd>
          <dt className="text-muted-foreground">External links</dt>
          <dd className="tabular-nums text-foreground">{stats.external}</dd>
        </dl>
        {stats.outline.length ? (
          <ol className="mt-1 grid gap-0.5 text-sm" aria-label="Outline">
            {stats.outline.map((heading) => (
              <li key={heading.id} className={cn("truncate text-muted-foreground", heading.level === 3 && "pl-3", heading.level === 4 && "pl-6")}>
                {heading.text || "Untitled heading"}
              </li>
            ))}
          </ol>
        ) : null}
      </Section>

      <ConfirmDialog
        open={pendingSlug !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingSlug(null)
            setSlugDraft(post.slug)
          }
        }}
        title="Change this post’s URL?"
        description={`The live address /blog/${post.slug} will redirect (301) to /blog/${pendingSlug ?? ""}. Links people already have keep working.`}
        confirmLabel="Change URL"
        onConfirm={() => {
          if (pendingSlug) patch({ slug: pendingSlug })
          setPendingSlug(null)
        }}
      />
      <span className="sr-only">{title}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------------------------------------------

export function SeoTab({
  post,
  title,
  excerpt,
  readOnly,
  patch,
  patchSoon,
  otherPosts,
}: Pick<TabCommon, "post" | "title" | "excerpt" | "readOnly" | "patch" | "patchSoon"> & { otherPosts: OtherPost[] }) {
  const seoTitle = post.seo_title ?? ""
  const seoDescription = post.seo_description ?? ""
  const final = finalTitle(title, seoTitle)
  const serp = serpPreview({ title, seoTitle, seoDescription, excerpt, summary: post.summary, slug: post.slug })
  const others = otherPosts.filter((other) => other.id !== post.id)
  const norm = (value: string | null | undefined) => (value ?? "").trim().toLowerCase()
  const dupTitle = seoTitle.trim() ? others.find((o) => norm(o.seo_title || o.title) === norm(seoTitle)) : null
  const dupDescription = seoDescription.trim() ? others.find((o) => norm(o.seo_description) === norm(seoDescription)) : null
  const owner = post.focus_keyword?.trim() ? others.find((o) => norm(o.focus_keyword) === norm(post.focus_keyword)) : null
  const easnerCount = (final.text.match(/easner/gi) ?? []).length

  return (
    <div>
      <Section title="Search appearance" hint="What Google shows, with the title the website will render.">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="truncate text-xs text-muted-foreground">{serp.url}</p>
          <p className="mt-0.5 text-lg leading-6 text-info-text">{serp.title || "Untitled post"}</p>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{serp.description || "Add a description. Google will otherwise pick text from the post."}</p>
        </div>
        {easnerCount > 1 ? (
          <Alert variant="warning">
            <AlertTriangle aria-hidden />
            <AlertDescription>“Easner” appears {easnerCount} times in the title. Keep it to once.</AlertDescription>
          </Alert>
        ) : null}
      </Section>

      <Section title="Focus keyword" hint="The phrase this post should rank for.">
        <Input aria-label="Focus keyword" value={post.focus_keyword ?? ""} disabled={readOnly} onChange={(event) => patchSoon({ focus_keyword: event.target.value || null })} />
        {owner ? (
          <p className="text-xs font-medium text-warning-text">Already targeted by “{owner.title || owner.slug}”. Posts that share a keyword compete.</p>
        ) : null}
      </Section>

      <Section title="Meta title" hint={`Leave blank to use the post title. The site adds “ – Easner”${final.absolute ? " (not added: your title already says Easner)" : ""}.`}>
        <Input aria-label="Meta title" value={seoTitle} disabled={readOnly} placeholder={title} onChange={(event) => patchSoon({ seo_title: event.target.value || null })} />
        <Counter length={seoTitle.length} range={META_TITLE_RANGE} />
        {dupTitle ? <p className="text-xs font-medium text-warning-text">“{dupTitle.title || dupTitle.slug}” has the same title.</p> : null}
      </Section>

      <Section title="Meta description" hint="Falls back to the Summary, then the excerpt.">
        <Textarea aria-label="Meta description" rows={3} value={seoDescription} disabled={readOnly} onChange={(event) => patchSoon({ seo_description: event.target.value || null })} />
        <Counter length={seoDescription.length} range={META_DESCRIPTION_RANGE} />
        {dupDescription ? <p className="text-xs font-medium text-warning-text">“{dupDescription.title || dupDescription.slug}” has the same description.</p> : null}
      </Section>

      <Section title="Canonical URL" hint="Only for a post first published somewhere else. Leave blank otherwise.">
        <Input aria-label="Canonical URL" value={post.canonical_url ?? ""} disabled={readOnly} placeholder="https://" onChange={(event) => patchSoon({ canonical_url: event.target.value.trim() || null })} />
        {post.canonical_url && !/^https:\/\//.test(post.canonical_url) ? <p className="text-xs font-medium text-destructive-text">Use a full https:// address.</p> : null}
      </Section>

      <Section title="Visibility">
        <Toggle label="Hide from search engines" hint="Adds noindex. The post stays reachable by its link." checked={post.noindex} disabled={readOnly} onChange={(noindex) => patch({ noindex })} />
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Share preview: shown at the end of the SEO tab (Phase 4 adds the platform previews)
// ---------------------------------------------------------------------------------------------------------------

export function SocialTab({ post, title }: { post: PostFull; title: string }) {
  const url = fileUrl(post.cover_path)
  const point = post.cover_focal_point ?? { x: 0.5, y: 0.5 }
  return (
    <div>
      <Section title="Share preview" hint="The cover is the share image, full-bleed. Nothing is added around it.">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="bg-muted" style={{ aspectRatio: "1200 / 630" }}>
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element -- share crop preview
              <img src={url} alt="" className="size-full object-cover" style={{ objectPosition: `${point.x * 100}% ${point.y * 100}%` }} />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">Add a cover in the Post tab</div>
            )}
          </div>
          <div className="p-3">
            <p className="text-xs text-muted-foreground">easner.com</p>
            <p className="text-sm font-medium text-foreground">{title || "Untitled post"}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">X, LinkedIn, WhatsApp and Slack previews, and a different share image (1200 × 630), arrive in the next release.</p>
      </Section>
    </div>
  )
}
