"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Copy, ExternalLink, ImageOff, Link2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { copyText } from "@/components/ui/copy-field"
import { DetailList, DetailRow } from "@/components/ui/detail-list"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { useAuth } from "@/lib/auth-context"
import { archivePost, deletePost, duplicatePost, getPreviewLink, unarchivePost, unpublishPost } from "@/lib/blog/actions"
import { adminKeys, errorMessage, formatListDate, type PostRow } from "@/lib/queries"
import { pageKeys } from "@/lib/queries-pages"
import { permissionsFor } from "@/lib/roles"
import { blogFileUrl } from "@/lib/supabase"
import { SITE_ORIGIN } from "@easner/blog-content"

/** Published with a working copy reads "Changes not published" (plan §4, Posts list). */
export function displayStatus(post: PostRow): string {
  return post.status === "published" && post.has_unpublished_changes ? "changes_not_published" : post.status
}

type Props = { post: PostRow | null; categoryName?: string; onClose: () => void }
type Confirm = "unpublish" | "archive" | "delete" | null

/** The quick view (OffBlog): details, Copy link, Duplicate, Unpublish, Archive; View live or Copy preview link; Edit. */
export function PostQuickView({ post, categoryName, onClose }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { role, user } = useAuth()
  const { canPublish } = permissionsFor(role)
  const [confirm, setConfirm] = useState<Confirm>(null)

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adminKeys.posts() }),
      queryClient.invalidateQueries({ queryKey: pageKeys.postFlags() }),
    ])

  const websiteNote = (result: { status: string; note?: string } | undefined) => {
    if (result && result.status !== "ok") toast.info(result.note ?? "The website wasn’t refreshed. It updates on its own shortly.")
  }

  const unpublish = useMutation({
    mutationFn: () => unpublishPost(post!.id),
    onSuccess: async (result) => {
      await refresh()
      toast.success("Post unpublished. It’s a draft again.")
      websiteNote(result.website)
      setConfirm(null)
      onClose()
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t unpublish the post. Try again.")),
  })
  const archive = useMutation({
    mutationFn: () => archivePost(post!.id),
    onSuccess: async (result) => {
      await refresh()
      toast.success("Post archived")
      websiteNote(result.website)
      setConfirm(null)
      onClose()
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t archive the post. Try again.")),
  })
  const remove = useMutation({
    mutationFn: () => deletePost(post!.id),
    onSuccess: async () => {
      await refresh()
      toast.success("Post deleted")
      setConfirm(null)
      onClose()
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t delete the post. Try again.")),
  })
  const unarchive = useMutation({
    mutationFn: () => unarchivePost(post!.id),
    onSuccess: async () => {
      await refresh()
      toast.success("Post restored as a draft")
      onClose()
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t restore the post. Try again.")),
  })
  const duplicate = useMutation({
    mutationFn: () => duplicatePost(post!.id),
    onSuccess: async (id) => {
      await refresh()
      toast.success("Duplicated as a draft")
      router.push(`/posts/${id}`)
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t duplicate the post. Try again.")),
  })

  const copyLink = async () => {
    if (!post) return
    const ok = await copyText(`${SITE_ORIGIN}/blog/${post.slug}`)
    if (ok) toast.success("Link copied")
    else toast.error("Couldn’t copy the link")
  }
  const previewLink = useMutation({
    mutationFn: () => getPreviewLink(post!.id),
    onSuccess: async (result) => {
      if ("url" in result) {
        const ok = await copyText(result.url)
        if (ok) toast.success("Preview link copied. It works for 30 minutes.")
        else toast.error("Couldn’t copy the link")
      } else toast.info(result.skipped)
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t make a preview link. Try again.")),
  })

  const cover = post ? blogFileUrl(post.cover_path) : null
  const isLive = post?.status === "published"
  // Writers open the editor only on their own drafts (and posts sent back to them).
  const canEdit =
    post !== null &&
    (canPublish || (post.created_by === user?.id && (post.status === "draft" || post.status === "changes_requested")))

  return (
    <>
      <Sheet open={Boolean(post)} onOpenChange={(open) => !open && onClose()}>
        <SheetContent>
          {post ? (
            <>
              <SheetHeader>
                <SheetTitle>{post.title || "Untitled"}</SheetTitle>
                <SheetDescription asChild>
                  <div className="pt-1">
                    <StatusBadge status={displayStatus(post)} />
                  </div>
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 pb-6">
                <div className="flex aspect-video items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Storage URL.
                    <img src={cover} alt={post.cover_alt ?? ""} className="size-full object-cover" />
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      <ImageOff className="size-4" aria-hidden />
                      No cover yet
                    </span>
                  )}
                </div>
                <DetailList>
                  <DetailRow label="Slug" mono copyValue={post.slug}>
                    {post.slug}
                  </DetailRow>
                  <DetailRow label="Category">{categoryName}</DetailRow>
                  <DetailRow label="Authors">{post.authors.map((a) => a.name).join(", ")}</DetailRow>
                  <DetailRow label="Updated">{formatListDate(post.updated_at)}</DetailRow>
                  <DetailRow label="Published">{formatListDate(post.published_at)}</DetailRow>
                </DetailList>
                <div className="flex flex-wrap gap-2">
                  {isLive ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => void copyLink()}>
                      <Link2 aria-hidden />
                      Copy link
                    </Button>
                  ) : null}
                  {canEdit ? (
                    <Button type="button" variant="outline" size="sm" loading={duplicate.isPending} onClick={() => duplicate.mutate()}>
                      <Copy aria-hidden />
                      Duplicate
                    </Button>
                  ) : null}
                  {canPublish && (post.status === "published" || post.status === "scheduled") ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirm("unpublish")}>
                      Unpublish
                    </Button>
                  ) : null}
                  {canPublish && post.status === "archived" ? (
                    <Button type="button" variant="outline" size="sm" loading={unarchive.isPending} onClick={() => unarchive.mutate()}>
                      Restore as draft
                    </Button>
                  ) : null}
                  {canPublish && post.status !== "archived" ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirm("archive")}>
                      Archive
                    </Button>
                  ) : null}
                  {canPublish && !isLive ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setConfirm("delete")}>
                      Delete
                    </Button>
                  ) : null}
                </div>
              </div>
              <SheetFooter>
                {isLive ? (
                  <Button asChild variant="outline">
                    <a href={`${SITE_ORIGIN}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink aria-hidden />
                      View live
                    </a>
                  </Button>
                ) : post.status !== "archived" ? (
                  <Button type="button" variant="outline" loading={previewLink.isPending} onClick={() => previewLink.mutate()}>
                    <Link2 aria-hidden />
                    Copy preview link
                  </Button>
                ) : null}
                {canEdit ? (
                  <Button asChild variant="primary">
                    <Link href={`/posts/${post.id}`}>
                      <Pencil aria-hidden />
                      Edit
                    </Link>
                  </Button>
                ) : null}
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirm === "unpublish"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Unpublish this post?"
        description="It comes off easner.com and becomes a draft. Its link stops working until you publish it again."
        confirmLabel="Unpublish post"
        tone="destructive"
        pending={unpublish.isPending}
        onConfirm={() => unpublish.mutate()}
      />
      <ConfirmDialog
        open={confirm === "archive"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Archive this post?"
        description={
          isLive
            ? "It comes off easner.com and moves to Archived. You can restore it as a draft later."
            : "It moves to Archived. You can restore it as a draft later."
        }
        confirmLabel="Archive post"
        tone="destructive"
        pending={archive.isPending}
        onConfirm={() => archive.mutate()}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Delete this post?"
        description="It’s deleted for good, with its history and comments. This can’t be undone. To keep it, archive it instead."
        confirmLabel="Delete post"
        tone="destructive"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  )
}
