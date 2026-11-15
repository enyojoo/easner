"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { ImageIcon, ImageOff, Upload, UploadCloud } from "lucide-react"
import { fileNameOf, MediaDetail } from "@/components/media/media-detail"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { FilterTabs, type FilterTab } from "@/components/ui/filter-tabs"
import { TabHeader } from "@/components/layout/tab-header"
import { Progress } from "@/components/ui/progress"
import { SearchField } from "@/components/ui/search-field"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { uploadBlogImage } from "@/lib/media"
import { usePosts } from "@/lib/queries"
import { pageKeys, useMedia, useMediaUsage, type MediaRow } from "@/lib/queries-pages"
import { permissionsFor } from "@/lib/roles"
import { blogFileUrl } from "@/lib/supabase"
import { cn } from "@/lib/utils"

type Filter = "all" | "covers" | "used" | "unused" | "no-alt"

function isCover(m: MediaRow): boolean {
  if (!m.width || !m.height) return false
  const ratio = m.width / m.height
  return m.width >= 1600 && Math.abs(ratio - 16 / 9) < 0.02
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

type UploadItem = { key: string; file: File; progress: number; error: string | null }

function MediaPageInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { role } = useAuth()
  const { canDeletePosts } = permissionsFor(role)

  const filter = (["all", "covers", "used", "unused", "no-alt"].includes(searchParams.get("filter") ?? "")
    ? searchParams.get("filter")
    : "all") as Filter
  const urlQuery = searchParams.get("q") ?? ""
  const [search, setSearch] = useState(urlQuery)
  const [openId, setOpenId] = useState<string | null>(null)
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(patch)) {
        if (v) params.set(k, v)
        else params.delete(k)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (search.trim() !== urlQuery.trim()) setParams({ q: search.trim() || null })
    }, 250)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const mediaQuery = useMedia()
  const usageQuery = useMediaUsage()
  const postsQuery = usePosts()
  const media = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data])
  const usage = useMemo(() => usageQuery.data ?? [], [usageQuery.data])
  const usedIds = useMemo(() => new Set(usage.map((u) => u.media_id)), [usage])
  const usageCount = useMemo(() => {
    const counts = new Map<string, Set<string>>()
    for (const u of usage) (counts.get(u.media_id) ?? counts.set(u.media_id, new Set()).get(u.media_id)!).add(u.post_id)
    return counts
  }, [usage])

  const counts = useMemo(
    () => ({
      all: media.length,
      covers: media.filter(isCover).length,
      used: media.filter((m) => usedIds.has(m.id)).length,
      unused: media.filter((m) => !usedIds.has(m.id)).length,
      "no-alt": media.filter((m) => !m.alt?.trim()).length,
    }),
    [media, usedIds],
  )
  const tabs: ReadonlyArray<FilterTab<Filter>> = [
    { value: "all", label: "All", count: counts.all },
    { value: "covers", label: "Covers", count: counts.covers },
    { value: "used", label: "Used", count: counts.used },
    { value: "unused", label: "Not used", count: counts.unused },
    { value: "no-alt", label: "Missing alt text", count: counts["no-alt"] },
  ]

  const filtered = useMemo(() => {
    const q = urlQuery.trim().toLowerCase()
    return media.filter((m) => {
      if (filter === "covers" && !isCover(m)) return false
      if (filter === "used" && !usedIds.has(m.id)) return false
      if (filter === "unused" && usedIds.has(m.id)) return false
      if (filter === "no-alt" && m.alt?.trim()) return false
      if (q && !fileNameOf(m.path).toLowerCase().includes(q) && !(m.alt ?? "").toLowerCase().includes(q)) return false
      return true
    })
  }, [media, filter, urlQuery, usedIds])

  const totalSize = useMemo(() => filtered.reduce((sum, m) => sum + (m.size ?? 0), 0), [filtered])

  const runUpload = useCallback(
    async (item: UploadItem) => {
      setUploads((list) => list.map((u) => (u.key === item.key ? { ...u, error: null, progress: 0 } : u)))
      try {
        await uploadBlogImage(item.file, {
          folder: "media",
          onProgress: (fraction) => setUploads((list) => list.map((u) => (u.key === item.key ? { ...u, progress: fraction } : u))),
        })
        await queryClient.invalidateQueries({ queryKey: pageKeys.media() })
        setUploads((list) => list.filter((u) => u.key !== item.key))
      } catch (e) {
        const message = e instanceof Error ? e.message : "The upload failed. Try again."
        setUploads((list) => list.map((u) => (u.key === item.key ? { ...u, error: message } : u)))
      }
    },
    [queryClient],
  )

  const addFiles = useCallback(
    (files: File[]) => {
      const items = files.map((file) => ({ key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`, file, progress: 0, error: null }))
      if (!items.length) return
      setUploads((list) => [...items, ...list])
      items.forEach((item) => void runUpload(item))
    },
    [runUpload],
  )

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && /^(input|textarea)$/i.test(target.tagName)) return
      const files = Array.from(event.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"))
      if (files.length) {
        event.preventDefault()
        addFiles(files)
      }
    }
    document.addEventListener("paste", onPaste)
    return () => document.removeEventListener("paste", onPaste)
  }, [addFiles])

  const firstLoad = mediaQuery.data === undefined && !mediaQuery.isError
  const openMedia = openId ? (media.find((m) => m.id === openId) ?? null) : null

  const dropZone = (
    <div
      className="h-full"
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        addFiles(Array.from(e.dataTransfer.files))
      }}
    >
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={cn(
          "flex h-full min-h-[196px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-[1.5px] border-dashed p-5 text-center text-[13px] leading-[18px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          dragOver ? "border-primary bg-info-surface text-primary-text" : "border-primary/45 bg-surface-tint/60 text-muted-foreground hover:border-primary",
        )}
      >
        <UploadCloud className="size-6" aria-hidden />
        <span className="text-sm font-medium text-foreground">Drop images here</span>
        <span>or paste, or choose files.</span>
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <TabHeader
        title="Media"
        description="Every image uploaded to the blog. Alt text set here is used wherever the image appears."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload aria-hidden />
            Upload
          </Button>
        }
      />
      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="sr-only"
        aria-label="Choose images to upload"
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []))
          e.target.value = ""
        }}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField value={search} onChange={setSearch} placeholder="Search media" title="Matches file name and alt text." />
          <FilterTabs<Filter>
            variant="pills"
            ariaLabel="Filter media"
            tabs={tabs}
            value={filter}
            onChange={(next) => setParams({ filter: next === "all" ? null : next })}
          />
        </div>
        <p className="text-[13px] leading-[18px] text-muted-foreground" aria-live="polite">
          {mediaQuery.data ? `${filtered.length} ${filtered.length === 1 ? "image" : "images"} · ${formatBytes(totalSize)}` : " "}
        </p>
      </div>

      {mediaQuery.isError && !mediaQuery.data ? (
        <Card padding="none">
          <EmptyState
            icon={ImageIcon}
            title="Media didn’t load"
            message="Check your connection and try again."
            actions={
              <Button type="button" variant="outline" size="sm" onClick={() => void mediaQuery.refetch()}>
                Try again
              </Button>
            }
          />
        </Card>
      ) : firstLoad ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5" aria-busy="true" aria-label="Loading media">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : media.length === 0 && uploads.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={ImageIcon}
            title="Upload your first image"
            message="Images you add to posts, and covers, are kept here with their alt text."
            actions={
              <Button type="button" variant="primary" size="sm" onClick={() => fileInput.current?.click()}>
                Upload
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
          {dropZone}
          {uploads.map((item) => (
            <div key={item.key} className="overflow-hidden rounded-2xl border border-border/70 bg-card">
              <div className="flex aspect-video items-center justify-center bg-muted text-muted-foreground">
                <ImageIcon className="size-6" aria-hidden />
              </div>
              <div className="grid gap-1 px-3 py-2.5">
              <p className="truncate text-[13px] font-medium leading-[18px] text-foreground">{item.file.name}</p>
              {item.error ? (
                <div className="space-y-1.5">
                  <p className="text-xs text-destructive-text" role="alert">
                    {item.error}
                  </p>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => void runUpload(item)}>
                      Try again
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setUploads((l) => l.filter((u) => u.key !== item.key))}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Progress className="h-1.5" value={Math.round(item.progress * 100)} aria-label={`Uploading ${item.file.name}`} />
                  <p className="text-xs tabular-nums text-muted-foreground">Uploading · {Math.round(item.progress * 100)}%</p>
                </div>
              )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && media.length > 0 ? (
            <div className="col-span-full flex items-center justify-center rounded-2xl border border-border/70 bg-card p-8 text-sm text-muted-foreground md:col-span-3 xl:col-span-4">
              No images match these filters.
            </div>
          ) : null}
          {filtered.map((m) => {
            const url = blogFileUrl(m.path)
            const used = usageCount.get(m.id)?.size ?? 0
            const noAlt = !m.alt?.trim()
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpenId(m.id)}
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card text-left outline-none transition-shadow hover:shadow-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-muted text-muted-foreground">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Storage URLs; thumbs.
                    <img src={url} alt={m.alt ?? ""} loading="lazy" className="size-full object-cover" />
                  ) : (
                    <ImageOff className="size-5" aria-hidden />
                  )}
                  {isCover(m) ? (
                    <span className="absolute left-2 top-2 rounded-full bg-card px-2 py-0.5 text-xs font-medium text-foreground shadow-soft">Cover</span>
                  ) : null}
                </div>
                <div className="grid gap-0.5 px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium leading-[18px] text-foreground">{fileNameOf(m.path)}</p>
                  {noAlt ? (
                    <p className="text-xs leading-4 text-warning-text">Missing alt text</p>
                  ) : (
                    <p className="text-xs leading-4 text-muted-foreground">{used > 0 ? `Used in ${used} ${used === 1 ? "post" : "posts"}` : "Not used"}</p>
                  )}
                  <p className="text-xs leading-4 tabular-nums text-muted-foreground">{m.width && m.height ? `${m.width} × ${m.height}` : " "}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <MediaDetail media={openMedia} usage={usage} posts={postsQuery.data ?? []} canDelete={canDeletePosts} onClose={() => setOpenId(null)} />
    </div>
  )
}

export default function MediaPage() {
  return (
    <Suspense fallback={null}>
      <MediaPageInner />
    </Suspense>
  )
}
