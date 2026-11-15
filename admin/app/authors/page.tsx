"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDown, Mail, UserPlus, UserRoundPen } from "lucide-react"
import { toast } from "sonner"
import { SimpleTableSkeleton } from "@/components/admin-skeletons"
import { AuthorFields, draftFromAuthor, EMPTY_AUTHOR, saveAuthor, slugifyName, validateAuthor, type AuthorDraft } from "@/components/authors/author-form"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InviteDialog } from "@/components/team/invite-dialog"
import { DetailList, DetailRow } from "@/components/ui/detail-list"
import { EmptyState } from "@/components/ui/empty-state"
import { PageHeader } from "@/components/ui/page-header"
import { SearchField } from "@/components/ui/search-field"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { errorMessage } from "@/lib/queries"
import { pageKeys, profileGap, useAuthors, useMembersLite, bioToText, type AuthorRow } from "@/lib/queries-pages"
import { ROLE_LABEL, permissionsFor } from "@/lib/roles"
import { blogFileUrl } from "@/lib/supabase"

const COLUMNS = ["Author", "Location", "Posts", "Profile", "Login"]

function ProfileCell({ author }: { author: AuthorRow }) {
  const gap = profileGap(author)
  if (!gap) return <StatusBadge status="published">Complete</StatusBadge>
  return <StatusBadge status="in_review">{gap === "photo" ? "Missing photo" : "Missing bio"}</StatusBadge>
}

function loginLabel(author: AuthorRow): string {
  return author.member_role ? ROLE_LABEL[author.member_role] : "No login"
}

function AuthorsPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { role, user } = useAuth()
  const { canManageAuthors, canManageTeam } = permissionsFor(role)
  const [inviteOpen, setInviteOpen] = useState(false)
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
      toast.success(isNew ? "Guest author added" : "Author saved")
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
        description="The people behind each post. Their profile shows on posts and on easner.com/blog/authors."
        actions={
          canManageTeam ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <UserPlus aria-hidden />
                  New author
                  <ChevronDown aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuItem className="items-start gap-2" onSelect={() => setInviteOpen(true)}>
                  <Mail className="mt-0.5 size-4" aria-hidden />
                  <span>
                    <span className="block font-medium">Invite a team member</span>
                    <span className="block text-xs text-muted-foreground">An editor or writer with a login. Their author profile is created when they sign in.</span>
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="items-start gap-2" onSelect={() => open("new")}>
                  <UserRoundPen className="mt-0.5 size-4" aria-hidden />
                  <span>
                    <span className="block font-medium">Add a guest author</span>
                    <span className="block text-xs text-muted-foreground">A byline for someone outside the team. No login.</span>
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : canManageAuthors ? (
            <Button type="button" variant="outline" size="sm" onClick={() => open("new")}>
              <UserPlus aria-hidden />
              Add guest author
            </Button>
          ) : null
        }
      />
      <div className="space-y-3">
        <SearchField value={search} onChange={setSearch} placeholder="Search authors" />
        <p className="text-[13px] leading-[18px] text-muted-foreground" aria-live="polite">
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
                : "Team members get an author profile when they accept an invite. Guest authors, for people outside the team, don’t need a login."
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
                        <p className="truncate text-xs text-muted-foreground">{author.title ?? ""}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-0 truncate text-sm text-foreground min-[1180px]:table-cell">{author.location || "–"}</TableCell>
                  <TableCell className="text-sm tabular-nums text-foreground">{author.post_count}</TableCell>
                  <TableCell>
                    <ProfileCell author={author} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status="draft" showIcon={false}>
                      {loginLabel(author)}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />

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
              <SheetTitle>{isNew ? "New guest author" : (selected?.name ?? "Author")}</SheetTitle>
              <SheetDescription>
                {isNew
                  ? "A byline for someone outside the team. They have no login. To give someone a login, invite them as a team member instead."
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
                  {isNew ? "Add guest author" : "Save changes"}
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
