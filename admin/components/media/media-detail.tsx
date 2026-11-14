"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { CropPreview } from "@/components/media/crop-preview"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { StatusBadge } from "@/components/ui/status-badge"
import { Textarea } from "@/components/ui/textarea"
import { safeArea, type Focal } from "@/lib/blog/crops"
import { updateMediaAlt } from "@/lib/media"
import { errorMessage, type PostRow } from "@/lib/queries"
import { pageKeys, type MediaRow, type MediaUsageRow } from "@/lib/queries-pages"
import { blogFileUrl, supabase } from "@/lib/supabase"

type Props = {
  media: MediaRow | null
  usage: MediaUsageRow[]
  posts: PostRow[]
  canDelete: boolean
  onClose: () => void
}

export function fileNameOf(path: string): string {
  return path.split("/").pop() ?? path
}

/** Detail sheet: focal point preview, the crops it produces, alt text and caption, usage, delete. */
export function MediaDetail({ media, usage, posts, canDelete, onClose }: Props) {
  const queryClient = useQueryClient()
  const [alt, setAlt] = useState("")
  const [caption, setCaption] = useState("")
  const [focal, setFocal] = useState<Focal>({ x: 0.5, y: 0.5 })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reseed the form for the newly opened image.
    setAlt(media?.alt ?? "")
    setCaption(media?.caption ?? "")
    setFocal({ x: 0.5, y: 0.5 })
  }, [media?.id, media?.alt, media?.caption])

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: pageKeys.media() }),
      queryClient.invalidateQueries({ queryKey: pageKeys.mediaUsage() }),
    ])

  const save = useMutation({
    mutationFn: () => updateMediaAlt(media!.id, alt, caption),
    onSuccess: async () => {
      await refresh()
      toast.success("Saved")
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t save. Try again.")),
  })

  const used = media ? usage.filter((u) => u.media_id === media.id) : []
  const usedPosts = used.map((u) => ({ row: u, post: posts.find((p) => p.id === u.post_id) })).filter((x) => x.post)

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("blog_media").delete().eq("id", media!.id)
      if (error) throw error
      await supabase.storage.from("blog").remove([media!.path])
    },
    onSuccess: async () => {
      await refresh()
      toast.success("Image deleted")
      setConfirmDelete(false)
      onClose()
    },
    onError: (e) => toast.error(errorMessage(e, "Couldn’t delete the image. Try again.")),
  })

  const moveFocal = (clientX: number, clientY: number) => {
    const el = stage.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setFocal({
      x: Math.min(1, Math.max(0, (clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (clientY - r.top) / r.height)),
    })
  }

  const url = media ? blogFileUrl(media.path) : null
  const w = media?.width ?? 0
  const h = media?.height ?? 0
  const safe = w && h ? safeArea(w, h) : null
  const dirty = media ? (alt.trim() !== (media.alt ?? "") || caption.trim() !== (media.caption ?? "")) : false

  return (
    <>
      <Sheet open={Boolean(media)} onOpenChange={(o) => !o && onClose()}>
        <SheetContent>
          {media ? (
            <>
              <SheetHeader>
                <SheetTitle className="truncate font-mono text-base">{fileNameOf(media.path)}</SheetTitle>
                <SheetDescription>
                  {w && h ? `${w} × ${h}` : "Size unknown"} · {media.mime.replace("image/", "").toUpperCase()}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-6">
                <div>
                  <div
                    ref={stage}
                    className="relative touch-none overflow-hidden rounded-md bg-muted ring-1 ring-border/60"
                    style={{ aspectRatio: w && h ? `${w} / ${h}` : "16 / 9", cursor: "crosshair" }}
                    onPointerDown={(e) => {
                      dragging.current = true
                      e.currentTarget.setPointerCapture(e.pointerId)
                      moveFocal(e.clientX, e.clientY)
                    }}
                    onPointerMove={(e) => dragging.current && moveFocal(e.clientX, e.clientY)}
                    onPointerUp={() => (dragging.current = false)}
                  >
                    {url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Storage URL.
                      <img src={url} alt={media.alt ?? ""} draggable={false} className="size-full object-contain" />
                    ) : null}
                    {safe && w && h ? (
                      <div
                        className="pointer-events-none absolute border border-dashed border-primary-foreground/90 mix-blend-difference"
                        style={{ left: "10%", top: "10%", width: "80%", height: "80%" }}
                        aria-hidden
                      />
                    ) : null}
                    <span
                      className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-card"
                      style={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                      aria-hidden
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Drag the focal point to see the crops it produces. The dashed box is the safe area, the centre 80%.
                    The focal point itself is set per post, on its cover.
                  </p>
                </div>

                {w && h ? (
                  <div className="grid grid-cols-2 gap-4">
                    <CropPreview path={media.path} imgW={w} imgH={h} crop="share" focal={focal} width={200} label="Share 1200 × 630" />
                    <CropPreview path={media.path} imgW={w} imgH={h} crop="card" focal={focal} width={200} label="Card and header 16:9" />
                    <CropPreview path={media.path} imgW={w} imgH={h} crop="square" focal={focal} width={120} label="Square 1:1" />
                  </div>
                ) : null}

                <Field label="Alt text" hint="Describes the image for people who can’t see it. Required before a post using it can publish." error={!alt.trim() ? "Missing alt text." : undefined}>
                  <Textarea value={alt} onChange={(e) => setAlt(e.target.value)} rows={3} maxLength={300} />
                </Field>
                <Field label="Caption" optional>
                  <Input value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={500} />
                </Field>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {usedPosts.length === 0 ? "Not used" : `Used in ${usedPosts.length} ${usedPosts.length === 1 ? "post" : "posts"}`}
                  </h3>
                  {usedPosts.length > 0 ? (
                    <ul className="space-y-1.5">
                      {usedPosts.map(({ row, post }) => (
                        <li key={row.post_id} className="flex items-center justify-between gap-3 text-sm">
                          <Link href={`/posts/${post!.id}`} className="min-w-0 truncate text-primary-text hover:underline">
                            {post!.title || "Untitled"}
                          </Link>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className="text-xs text-muted-foreground">{row.in_cover ? "Cover" : "In the text"}</span>
                            <StatusBadge status={post!.status} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              <SheetFooter className="flex-row items-center justify-between gap-2 border-t border-border/60">
                {canDelete ? (
                  <div className="flex flex-col items-start gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive-text"
                      disabled={used.length > 0}
                      onClick={() => setConfirmDelete(true)}
                    >
                      Delete
                    </Button>
                    {used.length > 0 ? <span className="text-xs text-muted-foreground">In use, so it can’t be deleted.</span> : null}
                  </div>
                ) : (
                  <span />
                )}
                <Button type="button" variant="primary" disabled={!dirty} loading={save.isPending} loadingLabel="Saving…" onClick={() => save.mutate()}>
                  Save
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this image?"
        description="The file is removed from the library and from storage. This can’t be undone."
        confirmLabel="Delete image"
        tone="destructive"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
      />
    </>
  )
}
