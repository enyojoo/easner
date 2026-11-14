"use client"

import { useRef, useState } from "react"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import { AvatarCropper } from "@/components/authors/avatar-cropper"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { uploadAvatarBlob } from "@/lib/media"
import { BIO_MAX, bioToText, textToBio, type AuthorRow, type MemberLite } from "@/lib/queries-pages"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { blogFileUrl, supabase } from "@/lib/supabase"

export type AuthorDraft = {
  name: string
  slug: string
  title: string
  location: string
  bio: string
  avatar_path: string | null
  x_url: string
  linkedin_url: string
  github_url: string
  website_url: string
  member_id: string | null
}

export const EMPTY_AUTHOR: AuthorDraft = {
  name: "",
  slug: "",
  title: "",
  location: "",
  bio: "",
  avatar_path: null,
  x_url: "",
  linkedin_url: "",
  github_url: "",
  website_url: "",
  member_id: null,
}

export function draftFromAuthor(a: AuthorRow | null): AuthorDraft {
  if (!a) return EMPTY_AUTHOR
  return {
    name: a.name,
    slug: a.slug,
    title: a.title ?? "",
    location: a.location ?? "",
    bio: bioToText(a.bio),
    avatar_path: a.avatar_path,
    x_url: a.x_url ?? "",
    linkedin_url: a.linkedin_url ?? "",
    github_url: a.github_url ?? "",
    website_url: a.website_url ?? "",
    member_id: a.member_id,
  }
}

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugifyName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120)
}

export type AuthorErrors = Partial<Record<keyof AuthorDraft, string>>

export function validateAuthor(draft: AuthorDraft, opts: { checkSlug: boolean }): AuthorErrors {
  const errors: AuthorErrors = {}
  if (!draft.name.trim()) errors.name = "Add a name."
  if (opts.checkSlug && !SLUG_PATTERN.test(draft.slug)) errors.slug = "Lower-case words joined by hyphens."
  if (draft.bio.length > BIO_MAX) errors.bio = `Keep the bio to ${BIO_MAX} characters.`
  for (const key of ["x_url", "linkedin_url", "github_url", "website_url"] as const) {
    const value = draft[key].trim()
    if (value && !/^https:\/\/\S+$/.test(value)) errors[key] = "Use a full link that starts with https://"
  }
  return errors
}

/** Insert (id null) or update. `editor` may also change the slug and the linked member. */
export async function saveAuthor(id: string | null, draft: AuthorDraft, editor: boolean): Promise<AuthorRow["id"]> {
  const base = {
    name: draft.name.trim(),
    title: draft.title.trim() || null,
    location: draft.location.trim() || null,
    bio: textToBio(draft.bio),
    avatar_path: draft.avatar_path,
    x_url: draft.x_url.trim() || null,
    linkedin_url: draft.linkedin_url.trim() || null,
    github_url: draft.github_url.trim() || null,
    website_url: draft.website_url.trim() || null,
  }
  if (!id) {
    const { data, error } = await supabase
      .from("blog_authors")
      .insert({ ...base, slug: draft.slug, member_id: draft.member_id })
      .select("id")
      .single()
    if (error) throw error
    return (data as { id: string }).id
  }
  const patch = editor ? { ...base, slug: draft.slug, member_id: draft.member_id } : base
  const { error } = await supabase.from("blog_authors").update(patch).eq("id", id)
  if (error) throw error
  return id
}

type FieldsProps = {
  draft: AuthorDraft
  onChange: (patch: Partial<AuthorDraft>) => void
  errors: AuthorErrors
  /** Editors and Owners: slug and linked member are editable. */
  editor: boolean
  isNew?: boolean
  members?: MemberLite[]
  /** Slug auto-follows the name until it's edited by hand (new authors only). */
  onNameChange?: (name: string) => void
}

const NO_MEMBER = "none"

export function AuthorFields({ draft, onChange, errors, editor, members = [], onNameChange }: FieldsProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const photoUrl = blogFileUrl(draft.avatar_path)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar name={draft.name || "Author"} src={photoUrl} size="lg" />
        <div className="space-y-1">
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Camera aria-hidden />
            {photoUrl ? "Replace photo" : "Add photo"}
          </Button>
          <p className="text-xs text-muted-foreground">Square, at least 400 × 400. JPG, PNG or WebP.</p>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            className="sr-only"
            aria-label="Choose a photo"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ""
              if (file) setCropFile(file)
            }}
          />
        </div>
      </div>
      <AvatarCropper
        file={cropFile}
        onCancel={() => setCropFile(null)}
        onConfirm={async (blob) => {
          const media = await uploadAvatarBlob(blob, draft.name || "author")
          onChange({ avatar_path: media.path })
          setCropFile(null)
          toast.success("Photo added. Save to keep it.")
        }}
      />

      <Field label="Name" error={errors.name}>
        <Input
          value={draft.name}
          onChange={(e) => (onNameChange ? onNameChange(e.target.value) : onChange({ name: e.target.value }))}
          maxLength={120}
        />
      </Field>
      <Field label="Role" optional hint="Shown under the name, e.g. Head of Product, Easner.">
        <Input value={draft.title} onChange={(e) => onChange({ title: e.target.value })} maxLength={120} />
      </Field>
      <Field label="Location" optional>
        <Input value={draft.location} onChange={(e) => onChange({ location: e.target.value })} maxLength={120} />
      </Field>
      <Field
        label="Bio"
        error={errors.bio}
        hint={
          <span className="tabular-nums" aria-live="polite">
            {draft.bio.length} / {BIO_MAX}
          </span>
        }
      >
        <Textarea value={draft.bio} onChange={(e) => onChange({ bio: e.target.value })} rows={4} />
      </Field>
      <Field label="X" optional error={errors.x_url}>
        <Input value={draft.x_url} onChange={(e) => onChange({ x_url: e.target.value })} placeholder="https://x.com/…" inputMode="url" />
      </Field>
      <Field label="LinkedIn" optional error={errors.linkedin_url}>
        <Input value={draft.linkedin_url} onChange={(e) => onChange({ linkedin_url: e.target.value })} placeholder="https://www.linkedin.com/in/…" inputMode="url" />
      </Field>
      <Field label="GitHub" optional error={errors.github_url}>
        <Input value={draft.github_url} onChange={(e) => onChange({ github_url: e.target.value })} placeholder="https://github.com/…" inputMode="url" />
      </Field>
      <Field label="Website" optional error={errors.website_url}>
        <Input value={draft.website_url} onChange={(e) => onChange({ website_url: e.target.value })} placeholder="https://…" inputMode="url" />
      </Field>

      <Field
        label="URL"
        error={errors.slug}
        hint={editor ? `/blog/authors/${draft.slug || "…"}` : "Only an Editor can change the author URL."}
      >
        <Input
          value={draft.slug}
          onChange={(e) => onChange({ slug: e.target.value.toLowerCase() })}
          readOnly={!editor}
          disabled={!editor}
          className="font-mono"
          autoCapitalize="none"
          spellCheck={false}
          aria-readonly={!editor}
        />
      </Field>
      {editor ? (
        <Field label="Linked login" optional hint="Leave empty for a shared byline or a guest author with no login.">
          <Select value={draft.member_id ?? NO_MEMBER} onValueChange={(v) => onChange({ member_id: v === NO_MEMBER ? null : v })}>
            <SelectTrigger aria-label="Linked login">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_MEMBER}>No login</SelectItem>
              {members.map((m) => (
                <SelectItem key={m.user_id} value={m.user_id}>
                  {m.name || m.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}
    </div>
  )
}
