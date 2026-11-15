"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, UserRoundPen } from "lucide-react"
import { toast } from "sonner"
import { SimpleTableSkeleton } from "@/components/admin-skeletons"
import { AuthorFields, draftFromAuthor, EMPTY_AUTHOR, saveAuthor, slugifyName, validateAuthor, type AuthorDraft } from "@/components/authors/author-form"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DetailList, DetailRow } from "@/components/ui/detail-list"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { SearchField } from "@/components/ui/search-field"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { errorMessage } from "@/lib/queries"
import { pageKeys, profileGap, useAuthors, useMembersLite, bioToText, type AuthorRow } from "@/lib/queries-pages"
import { ROLE_LABEL, permissionsFor } from "@/lib/roles"
import { blogFileUrl } from "@/lib/supabase"

const COLUMNS = ["Author", "Location", "Posts", "Profile", "Login"]

function ProfileCell({ author }: { author: AuthorRow }) {
  const gap = profileGap(author)
  if (!gap) return <span className="text-sm text-success-text">Complete</span>
  return <span className="text-sm text-warning-text">{gap === "photo" ? "Missing photo" : "Missing bio"}</span>
}

function loginLabel(author: AuthorRow): string {
  return author.member_role ? ROLE_LABEL[author.member_role] : "No login"
}

function AuthorsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { role, user } = useAuth()
  const { canManageAuthors } = permissionsFor(role)
  const queryClient = useQueryClient()
  const urlQuery = searchParams.get("q") ?? ""
  const [search, setSearch] = useState(urlQuery)

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = search.trim()
      if (next === urlQuery.trim()) return
      const params = new URLSearchParams(searchParams.toString())
      if (next) params.set("q", next)
      else params.delete("q")
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }, 250)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const authorsQuery = useAuthors()
  const membersQuery = useMembersLite()
  const authors = useMemo(() => authorsQuery.data ?? [], [authorsQuery.data])
  const filtered = useMemo(() => {
    const q = urlQuery.trim().toLowerCase()
    return q ? authors.filter((a) => a.name.toLowerCase().includes(q) || (a.title ?? "").toLowerCase().includes(q)) : authors
  }, [authors, urlQuery])

  const [openId, setOpenId] = useState<string | "new" | null>(null)
  const selected = openId && openId !== "new" ? (authors.find((a) => a.id === openId) ?? null) : null
  const isNew = openId === "new"
  const [draft, setDraft] = useState<AuthorDraft>(EMPTY_AUTHOR)
  const [slugTouched, setSlugTouched] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const open = (id: string | "new") => {
    const row = id === "new" ? null : (authors.find((a) => a.id === id) ?? null)
    setDraft(draftFromAuthor(row))
    setSlugTouched(false)
    setShowErrors(false)
    setOpenId(id)
  }

  const errors = validateAuthor(draft, { checkSlug: canManageAuthors })
  const save = useMutation({
    mutationFn: () => saveAuthor(isNew ? null : (selected?.id ?? null), draft, canManageAuthors),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: pageKeys.authors() })
      toast.success(isNew ? "Author added" : "Author saved")
      setOpenId(null)
    },
    onError: (error) => toast.error(errorMessage(error, "Couldn’t save the author. Try again.")),
  })

  const firstLoad = authorsQuery.data === undefined && !authorsQuery.isError
  const sheetOpen = isNew || Boolean(selected)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authors"
        description="Who writes for the blog, and their public profiles."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/authors/me">My profile</Link>
            </Button>
            {canManageAuthors ? (
              <Button type="button" variant="primary" size="sm" onClick={() => open("new")}>
                <Plus aria-hidden />
                New author
              </Button>
            ) : null}
          </div>
        }
      />
      <div className="space-y-3">
        <SearchField value={search} onChange={setSearch} placeholder="Search authors" />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {authorsQuery.data ? `${filtered.length} ${filtered.length === 1 ? "author" : "authors"}` : " "}
        </p>
      </div>

      <Card padding="none" className="gap-0 overflow-hidden">
        {authorsQuery.isError && !authorsQuery.data ? (
          <EmptyState
            icon={UserRoundPen}
            title="Authors didn’t load"
            message="Check your connection and try again."
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => void authorsQuery.refetch()}>
                Try again
              </Button>
            }
          />
        ) : firstLoad ? (
          <SimpleTableSkeleton columns={COLUMNS} label="Loading authors" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UserRoundPen}
            title={urlQuery ? "No authors match this search" : "No authors yet"}
            message={
              urlQuery
                ? "Try a different name."
                : "Author profiles (photo, role, bio and links) will show here. Guest authors don’t need a login."
            }
            actions={
              !urlQuery ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/authors/me">Set up your profile</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[240px]">Author</TableHead>
                <TableHead className="hidden w-[160px] min-[1180px]:table-cell">Location</TableHead>
                <TableHead className="w-[80px]">Posts</TableHead>
                <TableHead className="w-[160px]">Profile</TableHead>
                <TableHead className="w-[140px]">Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((author) => (
                <TableRow
                  key={author.id}
                  tabIndex={0}
                  aria-label={`${author.name}, open`}
                  className="h-14 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  onClick={() => (author.member_id && author.member_id === user?.id && !canManageAuthors ? router.push("/authors/me") : open(author.id))}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget || e.key !== "Enter") return
                    e.preventDefault()
                    open(author.id)
                  }}
                >
                  <TableCell className="max-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar name={author.name} src={blogFileUrl(author.avatar_path)} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{author.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{author.title || "No role"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-0 truncate text-sm text-foreground min-[1180px]:table-cell">{author.location || "–"}</TableCell>
                  <TableCell className="text-sm tabular-nums text-foreground">{author.post_count}</TableCell>
                  <TableCell>
                    <ProfileCell author={author} />
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{loginLabel(author)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={(e) => {
              e.preventDefault()
              setShowErrors(true)
              if (Object.keys(errors).length === 0 && !save.isPending) save.mutate()
            }}
          >
            <SheetHeader>
              <SheetTitle>{isNew ? "New author" : (selected?.name ?? "Author")}</SheetTitle>
              <SheetDescription>
                {isNew
                  ? "A byline for a teammate or a guest. A guest author has no login."
                  : canManageAuthors
                    ? "Changing the URL changes the author page’s address."
                    : "Only editors and owners can edit other authors."}
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {canManageAuthors ? (
                <AuthorFields
                  draft={draft}
                  onChange={(patch) => {
                    if ("slug" in patch) setSlugTouched(true)
                    setDraft((d) => ({ ...d, ...patch }))
                  }}
                  onNameChange={(name) => setDraft((d) => ({ ...d, name, slug: isNew && !slugTouched ? slugifyName(name) : d.slug }))}
                  errors={showErrors ? errors : {}}
                  editor
                  isNew={isNew}
                  members={membersQuery.data ?? []}
                />
              ) : selected ? (
                <DetailList>
                  <DetailRow label="Role">{selected.title}</DetailRow>
                  <DetailRow label="Location">{selected.location}</DetailRow>
                  <DetailRow label="Bio">{bioToText(selected.bio)}</DetailRow>
                  <DetailRow label="Posts">{String(selected.post_count)}</DetailRow>
                </DetailList>
              ) : null}
            </div>
            {canManageAuthors ? (
              <SheetFooter className="flex-row items-center justify-end gap-2 border-t border-border/60">
                <Button type="submit" variant="primary" loading={save.isPending} loadingLabel="Saving…">
                  {isNew ? "Add author" : "Save changes"}
                </Button>
              </SheetFooter>
            ) : null}
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default function AuthorsPage() {
  return (
    <Suspense fallback={null}>
      <AuthorsPageInner />
    </Suspense>
  )
}
