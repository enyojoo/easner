"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FolderOpen, Lock, Plus } from "lucide-react"
import { toast } from "sonner"
import { SimpleTableSkeleton } from "@/components/admin-skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailList, DetailRow } from "@/components/ui/detail-list"
import { EmptyState } from "@/components/ui/empty-state"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { TabHeader } from "@/components/layout/tab-header"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth-context"
import { adminKeys, errorMessage, formatListDate, useCategories, usePosts, type CategoryRow } from "@/lib/queries"
import { StatusBadge } from "@/components/ui/status-badge"
import { permissionsFor } from "@/lib/roles"
import { supabase } from "@/lib/supabase"

const COLUMNS = ["Category", "Description", "Posts", "Latest post", "On the blog"]
/** Plan §3: the admin warns above 8 categories; the index chip row should fit on one line. */
const SOFT_CAP = 8
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

type Draft = {
  name: string
  slug: string
  description: string
  sort_order: string
  seo_title: string
  seo_description: string
}

const EMPTY_DRAFT: Draft = { name: "", slug: "", description: "", sort_order: "", seo_title: "", seo_description: "" }

function toDraft(category: CategoryRow | null, nextOrder: number): Draft {
  if (!category) return { ...EMPTY_DRAFT, sort_order: String(nextOrder) }
  return {
    name: category.name,
    slug: category.slug,
    description: category.description,
    sort_order: String(category.sort_order),
    seo_title: category.seo_title ?? "",
    seo_description: category.seo_description ?? "",
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

function CategoriesPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { role } = useAuth()
  const { canManageCategories } = permissionsFor(role)

  const categoriesQuery = useCategories()
  const postsQuery = usePosts()
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])
  const active = categories.filter((category) => !category.archived_at)
  const postCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const post of postsQuery.data ?? []) {
      if (post.category_id) counts.set(post.category_id, (counts.get(post.category_id) ?? 0) + 1)
    }
    return counts
  }, [postsQuery.data])
  // Latest published post per category. A category with none is Hidden: no chip, no sitemap entry, URL 404s.
  const latestPublished = useMemo(() => {
    const latest = new Map<string, string>()
    for (const post of postsQuery.data ?? []) {
      if (post.status !== "published" || !post.category_id || !post.published_at) continue
      const current = latest.get(post.category_id)
      if (!current || post.published_at > current) latest.set(post.category_id, post.published_at)
    }
    return latest
  }, [postsQuery.data])

  // ?open=<slug> opens that category (Jump to links here); ?open=new starts a new one.
  const openParam = searchParams.get("open")
  const selected = openParam && openParam !== "new" ? (categories.find((c) => c.slug === openParam) ?? null) : null
  const sheetOpen = openParam === "new" ? canManageCategories : Boolean(selected)
  const setOpen = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("open", value)
    else params.delete("open")
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const nextOrder = (categories.reduce((max, category) => Math.max(max, category.sort_order), 0) || 0) + 10
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [slugTouched, setSlugTouched] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const draftKey = openParam === "new" ? "new" : (selected?.id ?? null)
  useEffect(() => {
    if (!draftKey) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset the form when a different category opens.
    setDraft(toDraft(selected, nextOrder))
    setSlugTouched(Boolean(selected))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey])

  const isNew = openParam === "new"
  const slugError = draft.slug && !SLUG_PATTERN.test(draft.slug) ? "Lower-case letters, numbers and single hyphens." : null
  const orderValue = Number.parseInt(draft.sort_order, 10)
  const canSave =
    canManageCategories && draft.name.trim().length > 0 && SLUG_PATTERN.test(draft.slug) && Number.isFinite(orderValue)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: adminKeys.categories() })

  const save = useMutation({
    mutationFn: async () => {
      const row = {
        name: draft.name.trim(),
        slug: draft.slug,
        description: draft.description.trim(),
        sort_order: orderValue,
        seo_title: draft.seo_title.trim() || null,
        seo_description: draft.seo_description.trim() || null,
      }
      const { error } = isNew
        ? await supabase.from("blog_categories").insert(row)
        : await supabase.from("blog_categories").update(row).eq("id", selected!.id)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidate()
      toast.success(isNew ? "Category added" : "Category saved")
      if (isNew) setOpen(null)
      else if (draft.slug !== selected?.slug) setOpen(draft.slug)
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t save the category. Try again.")),
  })

  const archive = useMutation({
    mutationFn: async (archived: boolean) => {
      const { error } = await supabase
        .from("blog_categories")
        .update({ archived_at: archived ? new Date().toISOString() : null })
        .eq("id", selected!.id)
      if (error) throw error
      return archived
    },
    onSuccess: async (archived) => {
      await invalidate()
      toast.success(archived ? "Category archived" : "Category restored")
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t change the category. Try again.")),
  })

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("blog_categories").delete().eq("id", selected!.id)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidate()
      setConfirmDelete(false)
      setOpen(null)
      toast.success("Category deleted")
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t delete the category. Try again.")),
  })

  const selectedPosts = selected ? (postCounts.get(selected.id) ?? 0) : 0
  const firstLoad = categoriesQuery.data === undefined && !categoriesQuery.isError
  const field = (key: keyof Draft) => ({
    value: draft[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft((current) => ({ ...current, [key]: event.target.value })),
    disabled: !canManageCategories,
  })

  return (
    <div className="space-y-6">
      <TabHeader
        title="Categories"
        description="One category per post. They drive the chips on easner.com/blog and each has its own page."
        actions={
          canManageCategories ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen("new")}>
              <Plus aria-hidden />
              New category
            </Button>
          ) : null
        }
      />

      <div className="space-y-1">
        <p className="text-[13px] leading-[18px] text-muted-foreground" aria-live="polite">
          {categoriesQuery.data
            ? `${active.length} ${active.length === 1 ? "category" : "categories"}${
                categories.length > active.length ? ` · ${categories.length - active.length} archived` : ""
              }`
            : " "}
        </p>
        {active.length > SOFT_CAP ? (
          <p className="text-xs text-warning-text">
            More than {SOFT_CAP} categories won’t fit on one line on the blog. Consider archiving one.
          </p>
        ) : null}
        {!canManageCategories && categoriesQuery.data ? (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Only editors and owners can change categories.
          </p>
        ) : null}
      </div>

      <Card padding="none" className="gap-0 overflow-hidden">
        {firstLoad ? (
          <SimpleTableSkeleton columns={COLUMNS} label="Loading categories" />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title={categoriesQuery.isError ? "Categories didn’t load" : "No categories yet"}
            message={
              categoriesQuery.isError ? "Check your connection and try again." : "Add a category so posts have a section."
            }
            actions={
              categoriesQuery.isError ? (
                <Button type="button" variant="outline" size="sm" onClick={() => void categoriesQuery.refetch()}>
                  Try again
                </Button>
              ) : null
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[260px]">Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-right">Posts</TableHead>
                <TableHead className="w-[130px]">Latest post</TableHead>
                <TableHead className="w-[130px]">On the blog</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  tabIndex={0}
                  aria-label={`${category.name}, open`}
                  className="h-14 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => setOpen(category.slug)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget || event.key !== "Enter") return
                    event.preventDefault()
                    setOpen(category.slug)
                  }}
                >
                  <TableCell>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate text-sm font-medium text-foreground">
                        {category.name}
                        {category.archived_at ? <Badge variant="slate">Archived</Badge> : null}
                      </div>
                      <p className="truncate font-mono text-xs text-muted-foreground">/blog/categories/{category.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-0 truncate text-sm text-muted-foreground">
                    {category.description || "–"}
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums text-foreground">
                    {postsQuery.data ? (postCounts.get(category.id) ?? 0) : "–"}
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">{formatListDate(latestPublished.get(category.id))}</TableCell>
                  <TableCell>
                    {postsQuery.data ? (
                      <StatusBadge status={latestPublished.has(category.id) && !category.archived_at ? "published" : "draft"}>
                        {latestPublished.has(category.id) && !category.archived_at ? "Shown" : "Hidden"}
                      </StatusBadge>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={(open) => !open && setOpen(null)}>
        <SheetContent>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              if (canSave && !save.isPending) save.mutate()
            }}
          >
            <SheetHeader>
              <SheetTitle>{isNew ? "New category" : (selected?.name ?? "Category")}</SheetTitle>
              <SheetDescription>
                {isNew
                  ? "It shows on the blog once it has a published post."
                  : canManageCategories
                    ? "Renaming the slug changes the archive page’s URL."
                    : "Only editors and owners can change categories."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
              {canManageCategories ? (
                <>
                  <Field label="Name">
                    <Input
                      {...field("name")}
                      maxLength={60}
                      autoFocus={isNew}
                      onChange={(event) => {
                        const name = event.target.value
                        setDraft((current) => ({ ...current, name, slug: slugTouched ? current.slug : slugify(name) }))
                      }}
                    />
                  </Field>
                  <Field label="Slug" hint={`/blog/categories/${draft.slug || "…"}`} error={slugError}>
                    <Input
                      {...field("slug")}
                      className="font-mono"
                      maxLength={120}
                      onChange={(event) => {
                        setSlugTouched(true)
                        setDraft((current) => ({ ...current, slug: event.target.value.toLowerCase() }))
                      }}
                    />
                  </Field>
                  <Field label="Description" hint="One line under the category name on the blog.">
                    <Textarea {...field("description")} rows={3} maxLength={300} />
                  </Field>
                  <Field label="Order" hint="Lower numbers come first in the blog’s category chips.">
                    <Input {...field("sort_order")} inputMode="numeric" className="w-32 tabular-nums" />
                  </Field>
                  <Field label="SEO title" optional hint="Defaults to the name.">
                    <Input {...field("seo_title")} maxLength={120} />
                  </Field>
                  <Field label="SEO description" optional hint="Defaults to the description.">
                    <Textarea {...field("seo_description")} rows={3} maxLength={300} />
                  </Field>
                </>
              ) : selected ? (
                <DetailList>
                  <DetailRow label="Slug" mono>
                    {selected.slug}
                  </DetailRow>
                  <DetailRow label="Description">{selected.description}</DetailRow>
                  <DetailRow label="Posts">{String(selectedPosts)}</DetailRow>
                  <DetailRow label="Order">{String(selected.sort_order)}</DetailRow>
                </DetailList>
              ) : null}
            </div>

            {canManageCategories ? (
              <SheetFooter className="flex-row items-center justify-between gap-2 border-t border-border/60">
                <div className="flex gap-2">
                  {!isNew && selected ? (
                    selectedPosts === 0 ? (
                      <Button type="button" variant="ghost" className="text-destructive-text" onClick={() => setConfirmDelete(true)}>
                        Delete
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        loading={archive.isPending}
                        onClick={() => archive.mutate(!selected.archived_at)}
                      >
                        {selected.archived_at ? "Restore" : "Archive"}
                      </Button>
                    )
                  ) : null}
                </div>
                <Button type="submit" variant="primary" disabled={!canSave} loading={save.isPending} loadingLabel="Saving…">
                  {isNew ? "Add category" : "Save changes"}
                </Button>
              </SheetFooter>
            ) : null}
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${selected?.name ?? "this category"}?`}
        description="It has no posts. Its archive page goes away. This can’t be undone."
        confirmLabel="Delete category"
        tone="destructive"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesPageInner />
    </Suspense>
  )
}
