"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { EditorContent, useEditor, type Editor } from "@tiptap/react"
import { ImagePlus, AlertTriangle, Info, Tag } from "lucide-react"
import { toast } from "sonner"
import { EMPTY_DOC, extractSummary, type DocNode } from "@easner/blog-content"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FilterTabs } from "@/components/ui/filter-tabs"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { PerformanceTab } from "@/components/analytics/performance-tab"
import { Textarea } from "@/components/ui/textarea"
import { AltTextDialog } from "@/components/editor/alt-dialog"
import { BlockHandle } from "@/components/editor/block-handle"
import { BrandLint } from "@/components/editor/brand-lint-extension"
import { EditorBubbleMenu } from "@/components/editor/bubble-menu"
import { CommentsPanel } from "@/components/editor/comments-panel"
import { CompareDialog } from "@/components/editor/compare-dialog"
import { HistoryPanel } from "@/components/editor/history-panel"
import { LockBanner } from "@/components/editor/lock-banner"
import { useEditLock } from "@/components/editor/use-edit-lock"
import { fileUrl } from "@/components/editor/cover-field"
import { buildExtensions } from "@/components/editor/extensions"
import { PublishDialog } from "@/components/editor/publish-dialog"
import { PostTab, SeoTab, SocialTab } from "@/components/editor/settings-tabs"
import { SlashCommand } from "@/components/editor/slash-menu"
import { TopBar, type TopBarAction } from "@/components/editor/top-bar"
import type {
  CommentRow,
  DraftSnapshot,
  EditorAdapter,
  EditorLookups,
  PostFull,
  ReviewState,
  RevisionRow,
  SettingsPatch,
  Viewer,
  WebsiteResult,
} from "@/components/editor/types"
import { useAutosave } from "@/components/editor/use-autosave"
import { adminKeys, errorMessage } from "@/lib/queries"
import { checkClaims } from "@/lib/blog/claims"
import { runChecklist, type ChecklistItem } from "@/lib/blog/checklist"
import { normalizeDoc } from "@/lib/blog/normalize"
import { prepareSave } from "@/lib/blog/derive"
import { slugFromTitle } from "@/lib/blog/slug"
import { KNOWN_SITE_PATHS } from "@/lib/blog/site-routes"
import { validateUpload } from "@/lib/blog/crops"
import { workflow } from "@/lib/blog/workflow"
import { browserZone, scheduledLine } from "@/lib/blog/schedule"
import { whenLabel } from "@/lib/blog/revision-format"
import { cn } from "@/lib/utils"

type PanelTab = "post" | "seo" | "performance" | "comments" | "history"

const docOf = (post: PostFull): DocNode => (post.draft_content ?? post.content ?? EMPTY_DOC) as DocNode

/** A textarea that grows with its text. */
function AutoTextarea({ value, onChange, onEnter, ...props }: Omit<React.ComponentProps<"textarea">, "onChange"> & { value: string; onChange: (value: string) => void; onEnter?: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      {...props}
      ref={ref}
      rows={1}
      style={{ minHeight: "1.3em" }}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\n/g, " "))}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault()
          onEnter?.()
        }
      }}
    />
  )
}

function websiteToast(result: WebsiteResult | undefined) {
  if (!result || result.status === "ok") return
  toast.message(result.status === "skipped" ? "Website not notified" : "Website not refreshed", { description: result.note })
}

export function PostEditor({
  initialPost,
  adapter,
  viewer,
  lookups,
  backHref = "/posts",
}: {
  initialPost: PostFull
  adapter: EditorAdapter
  viewer: Viewer
  lookups: EditorLookups
  backHref?: string
}) {
  const queryClient = useQueryClient()
  const [post, setPost] = useState(initialPost)
  const [title, setTitle] = useState(initialPost.title)
  const [excerpt, setExcerpt] = useState(initialPost.excerpt ?? "")
  const [doc, setDoc] = useState<DocNode>(() => docOf(initialPost))
  const [panelOpen, setPanelOpen] = useState(true)
  const [tab, setTab] = useState<PanelTab>("post")
  const [significant, setSignificant] = useState(true)
  const [review, setReview] = useState<ReviewState | null>(null)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentQuote, setCommentQuote] = useState<string | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)
  const [changesOpen, setChangesOpen] = useState(false)
  const [changesNote, setChangesNote] = useState("")
  const [confirm, setConfirm] = useState<null | "unpublish" | "archive" | "withdraw" | "unschedule">(null)
  const [dialogKey, setDialogKey] = useState(0)
  const [startInSchedule, setStartInSchedule] = useState(false)
  const [compare, setCompare] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [restoreTarget, setRestoreTarget] = useState<RevisionRow | null>(null)
  const [revisions, setRevisions] = useState<RevisionRow[]>([])
  const [historyKey, setHistoryKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [altRequest, setAltRequest] = useState<{ mediaId: string; src: string } | null>(null)
  const [linkRequest, setLinkRequest] = useState(0)
  const [issueCount, setIssueCount] = useState(0)

  const canvasRef = useRef<HTMLDivElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)
  const imageInput = useRef<HTMLInputElement>(null)
  const titleRef = useRef(title)
  const excerptRef = useRef(excerpt)
  const postRef = useRef(post)
  const imageHandler = useRef<(files: File[], pos: number | null) => void>(() => {})
  const editorRef = useRef<Editor | null>(null)
  const lastDocKey = useRef(JSON.stringify(normalizeDoc(docOf(initialPost))))
  useEffect(() => {
    titleRef.current = title
    excerptRef.current = excerpt
    postRef.current = post
  })

  // The database is the authority on claims; the live check makes the banner and the buttons react as you type.
  const claims = useMemo(() => checkClaims({ title, excerpt, doc }), [title, excerpt, doc])
  const flagged = post.claims_flagged || claims.flagged

  const flow = useMemo(
    () => workflow({ role: viewer.role, userId: viewer.id, post: { ...post, claims_flagged: flagged }, review }),
    [viewer.role, viewer.id, post, flagged, review],
  )
  const discardRef = useRef<() => void>(() => {})
  // The edit lock: read-only unless you hold it. Locks only apply when your role may edit this post at all.
  const lock = useEditLock({
    adapter,
    postId: post.id,
    canEdit: flow.canEdit,
    onLost: () => discardRef.current(),
    onTakenOver: () => setHistoryKey((n) => n + 1),
  })
  const readOnly = !flow.canEdit || lock.state === "checking" || lock.state === "busy" || lock.state === "lost"
  const autosaveEnabled = flow.canEdit && lock.state !== "busy" && lock.state !== "lost"

  // ---- autosave -----------------------------------------------------------------------------------------------

  const autosave = useAutosave({
    postId: post.id,
    enabled: autosaveEnabled,
    baseUpdatedAt: initialPost.updated_at,
    save: (snapshot) => adapter.saveDraft(post.id, snapshot),
    onSaved: () => {
      void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
    },
  })
  const { markDirty, flush, discard } = autosave
  useEffect(() => {
    discardRef.current = discard
  })

  const snapshotOf = useCallback((nextDoc: DocNode, nextTitle: string, nextExcerpt: string): DraftSnapshot => {
    const prepared = prepareSave({ title: nextTitle, excerpt: nextExcerpt, doc: nextDoc })
    setIssueCount(prepared.ok ? prepared.warnings.length : prepared.errors.length)
    return { title: nextTitle, excerpt: nextExcerpt, doc: prepared.ok ? prepared.doc : nextDoc }
  }, [])

  // ---- the editor ---------------------------------------------------------------------------------------------

  // The extension callbacks read refs when an event fires, never while rendering.
  /* eslint-disable react-hooks/refs, react-hooks/preserve-manual-memoization */
  const extensions = useMemo(
    () => [
      ...buildExtensions({
        onImageFiles: (files, pos) => imageHandler.current(files, pos),
        onDroppedImages: (count) =>
          toast.message(`${count} ${count === 1 ? "image" : "images"} from the pasted text wasn’t added`, {
            description: "Pasted documents link to their images. Drag the file in to upload it instead.",
          }),
      }),
      BrandLint,
      SlashCommand.configure({
        onPickImage: () => imageInput.current?.click(),
        hasSummary: () => Boolean(editorRef.current?.state.doc.firstChild?.type.name === "summary"),
      }),
    ],
    [],
  )
  /* eslint-enable react-hooks/refs, react-hooks/preserve-manual-memoization */

  const editor = useEditor({
    extensions,
    content: docOf(initialPost),
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "editor-prose min-h-[50vh] focus:outline-none", role: "textbox", "aria-multiline": "true", "aria-label": "Post body", spellcheck: "true" },
    },
    onCreate: ({ editor: created }) => {
      lastDocKey.current = JSON.stringify(normalizeDoc(created.getJSON()))
    },
    onUpdate: ({ editor: current }) => {
      const normalized = normalizeDoc(current.getJSON())
      // Opening a post fires an update with the same content; that is not an edit.
      const key = JSON.stringify(normalized)
      if (key === lastDocKey.current) return
      lastDocKey.current = key
      setDoc(normalized)
      markDirty(snapshotOf(normalized, titleRef.current, excerptRef.current))
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])
  useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [editor, readOnly])

  // A newer copy kept on this device (a crash, a closed tab, a dropped connection) wins over the server copy.
  const restored = useRef(false)
  useEffect(() => {
    if (!editor || restored.current) return
    restored.current = true
    void (async () => {
      const backup = await autosave.readBackup()
      if (!backup || !autosave.isNewerBackup(backup, { updatedAt: initialPost.updated_at })) return
      editor.commands.setContent(backup.doc, false)
      setTitle(backup.title)
      setExcerpt(backup.excerpt)
      setDoc(normalizeDoc(editor.getJSON()))
      markDirty({ title: backup.title, excerpt: backup.excerpt, doc: backup.doc })
      toast.message("Restored unsaved changes from this device", { description: "They’ll save to the draft in a moment." })
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  // ---- title, dek, settings -----------------------------------------------------------------------------------

  const settingsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const settingsQueue = useRef<SettingsPatch>({})
  const slugAuto = useRef(initialPost.slug.startsWith("draft-") || initialPost.slug === slugFromTitle(initialPost.title))

  const flushSettings = useCallback(async () => {
    if (settingsTimer.current) clearTimeout(settingsTimer.current)
    settingsTimer.current = null
    const patch = settingsQueue.current
    if (!Object.keys(patch).length) return
    settingsQueue.current = {}
    const before = postRef.current
    try {
      let result: { slug: string } | null = null
      try {
        result = await adapter.saveSettings(before.id, patch)
      } catch (error) {
        // An automatic slug that is already taken gets a number instead of an error.
        if (patch.slug && slugAuto.current && /duplicate key/i.test(errorMessage(error, ""))) {
          const retry = await adapter.saveSettings(before.id, { ...patch, slug: `${patch.slug}-${Math.floor(Math.random() * 90 + 10)}` })
          result = retry
          setPost((current) => ({ ...current, slug: retry.slug }))
        } else {
          throw error
        }
      }
      void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
      if (before.status === "published") {
        const oldCategory = patch.category_id !== undefined ? lookups.categories.find((c) => c.id === before.category_id)?.slug : undefined
        const slugChanged = result && result.slug !== before.slug
        if (slugChanged || oldCategory || patch.slug !== undefined || patch.category_id !== undefined) {
          websiteToast(await adapter.notifyWebsite(before.id, { oldSlug: slugChanged ? before.slug : undefined, oldCategorySlug: oldCategory }))
        }
      }
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t save that setting."))
    }
  }, [adapter, lookups.categories, queryClient])

  const patch = useCallback(
    (next: SettingsPatch) => {
      setPost((current) => ({ ...current, ...next }))
      settingsQueue.current = { ...settingsQueue.current, ...next }
      void flushSettings()
    },
    [flushSettings],
  )
  const patchSoon = useCallback(
    (next: SettingsPatch) => {
      setPost((current) => ({ ...current, ...next }))
      settingsQueue.current = { ...settingsQueue.current, ...next }
      if (settingsTimer.current) clearTimeout(settingsTimer.current)
      settingsTimer.current = setTimeout(() => void flushSettings(), 800)
    },
    [flushSettings],
  )
  useEffect(() => () => void flushSettings(), [flushSettings])

  const onTitleChange = (value: string) => {
    setTitle(value)
    titleRef.current = value
    markDirty(snapshotOf(doc, value, excerptRef.current))
    if (!postRef.current.published_at && slugAuto.current) {
      const slug = slugFromTitle(value)
      if (slug && slug !== postRef.current.slug) patchSoon({ slug })
    }
  }
  const onExcerptChange = (value: string) => {
    setExcerpt(value)
    excerptRef.current = value
    markDirty(snapshotOf(doc, titleRef.current, value))
  }
  const onSlugPatch = (next: SettingsPatch) => {
    if (next.slug !== undefined) slugAuto.current = false
    patch(next)
  }

  const changeAuthors = async (ids: string[]) => {
    setPost((current) => ({ ...current, authorIds: ids }))
    try {
      await adapter.setAuthors(post.id, ids)
      void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
      if (postRef.current.status === "published") websiteToast(await adapter.notifyWebsite(post.id, {}))
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t change the authors."))
    }
  }

  // ---- images -------------------------------------------------------------------------------------------------

  const insertImages = useCallback(
    async (files: File[], pos: number | null) => {
      if (!editor) return
      for (const file of files) {
        const problem = validateUpload(file)
        if (problem) {
          toast.error(problem)
          continue
        }
        const id = toast.loading(`Uploading ${file.name}…`)
        try {
          const media = await adapter.uploadImage(file, postRef.current.id)
          const node = {
            type: "image",
            attrs: { mediaId: media.id, src: media.url, alt: media.alt ?? "", width: "column", widthPx: media.width ?? undefined, heightPx: media.height ?? undefined },
          }
          const chain = editor.chain().focus()
          if (pos == null) chain.insertContent(node).run()
          else {
            const at = Math.min(editor.state.doc.resolve(Math.min(pos, editor.state.doc.content.size)).after(1), editor.state.doc.content.size)
            chain.insertContentAt(at, node).run()
          }
          toast.success("Image added", { id })
          setAltRequest({ mediaId: media.id, src: media.url })
        } catch (error) {
          toast.error(errorMessage(error, `Couldn’t upload ${file.name}.`), { id })
        }
      }
    },
    [adapter, editor],
  )
  useEffect(() => {
    imageHandler.current = (files, pos) => void insertImages(files, pos)
  }, [insertImages])

  const saveAlt = (alt: string) => {
    if (!editor || !altRequest) return
    editor.state.doc.descendants((node, position) => {
      if (node.type.name === "image" && node.attrs.mediaId === altRequest.mediaId) {
        editor.view.dispatch(editor.state.tr.setNodeMarkup(position, undefined, { ...node.attrs, alt }))
        return false
      }
    })
    setAltRequest(null)
  }

  const uploadCover = async (file: File) => {
    const problem = validateUpload(file)
    if (problem) return void toast.error(problem)
    try {
      const media = await adapter.uploadImage(file, post.id)
      patch({ cover_path: media.path, cover_alt: post.cover_alt ?? media.alt ?? null })
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t upload the cover."))
    }
  }

  // ---- review, comments ---------------------------------------------------------------------------------------

  const loadReview = useCallback(async () => {
    try {
      setReview(await adapter.reviewState(postRef.current.id))
    } catch {
      setReview(null)
    }
  }, [adapter])
  useEffect(() => {
    void loadReview()
  }, [loadReview, post.status, post.claims_flagged])

  useEffect(() => {
    let alive = true
    adapter
      .listComments(initialPost.id)
      .then((rows) => alive && setComments(rows))
      .catch(() => undefined)
      .finally(() => alive && setCommentsLoading(false))
    return () => {
      alive = false
    }
  }, [adapter, initialPost.id])

  const addComment = async (input: { body: string; quote?: string | null; parentId?: string | null }) => {
    try {
      const row = await adapter.addComment(post.id, input)
      setComments((current) => [...current, row])
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t add the comment."))
      throw error
    }
  }
  const resolveComment = async (id: string, resolved: boolean) => {
    try {
      await adapter.resolveComment(id, resolved)
      setComments((current) => current.map((row) => (row.id === id ? { ...row, resolved_at: resolved ? new Date().toISOString() : null } : row)))
    } catch (error) {
      toast.error(errorMessage(error, "Couldn’t update the comment."))
    }
  }
  const openComments = () => {
    setPanelOpen(true)
    setTab("comments")
  }

  // ---- claims, checklist --------------------------------------------------------------------------------------

  const checklist = useMemo(
    () =>
      runChecklist({
        post: { ...post, title, excerpt, claims_flagged: flagged },
        doc,
        authors: lookups.authors.filter((author) => post.authorIds.includes(author.id)),
        otherPosts: lookups.otherPosts.filter((other) => other.id !== post.id),
        knownPaths: KNOWN_SITE_PATHS,
        publishedSlugs: lookups.publishedSlugs,
      }),
    [post, title, excerpt, doc, flagged, lookups],
  )

  const goToItem = (item: ChecklistItem) => {
    setPublishOpen(false)
    const target = item.action?.target
    if (target === "seo") return void (setPanelOpen(true), setTab("seo"))
    if (target === "post" || target === "cover" || target === "authors") return void (setPanelOpen(true), setTab("post"))
    editor?.commands.focus()
  }

  // ---- actions ------------------------------------------------------------------------------------------------

  const settle = (next: PostFull) => {
    setPost((current) => ({ ...current, ...next, authorIds: current.authorIds }))
    void queryClient.invalidateQueries({ queryKey: adminKeys.posts() })
    void loadReview()
  }

  const run = async (label: string, work: () => Promise<void>) => {
    setBusy(true)
    try {
      await flush()
      await flushSettings()
      await work()
    } catch (error) {
      toast.error(errorMessage(error, `Couldn’t ${label}.`))
    } finally {
      setBusy(false)
    }
  }

  const openPublish = async (schedule = false) => {
    await flush()
    await flushSettings()
    await loadReview()
    setStartInSchedule(schedule)
    setDialogKey((n) => n + 1)
    setPublishOpen(true)
  }

  const onAction = (action: TopBarAction) => {
    switch (action) {
      case "submit":
        return void run("submit for review", async () => {
          settle(await adapter.submitForReview(post.id))
          toast.success("Submitted for review")
        })
      case "publish":
      case "update":
      case "approve":
      case "approve-publish":
        return void openPublish()
      case "reschedule":
        return void openPublish(true)
      case "unschedule":
        return setConfirm("unschedule")
      case "request-changes":
        return setChangesOpen(true)
      case "withdraw":
        return setConfirm("withdraw")
      case "unpublish":
      case "archive":
        return setConfirm(action)
      case "unarchive":
        return void run("restore the post", async () => {
          toast.message("Restoring archived posts arrives in the next release")
        })
    }
  }

  const confirmPublish = () =>
    void run("publish", async () => {
      if (flow.primary === "approve") {
        settle(await adapter.approve(post.id))
        toast.success("Approved. A second Editor can now publish it.")
        setPublishOpen(false)
        return
      }
      const result = await adapter.publish(post.id, { significant })
      settle(result.post)
      setPublishOpen(false)
      toast.success(post.published_at ? "Live post updated" : "Published")
      websiteToast(result.website)
    })

  const confirmSchedule = (at: Date) =>
    void run("schedule", async () => {
      const wasScheduled = post.status === "scheduled"
      settle(await adapter.schedule(post.id, at))
      setPublishOpen(false)
      toast.success(wasScheduled ? "Schedule changed" : "Scheduled", { description: scheduledLine(at.toISOString(), browserZone()) })
    })

  const unschedule = () =>
    void run("unschedule", async () => {
      settle(await adapter.unschedule(post.id))
      setPublishOpen(false)
      setConfirm(null)
      toast.success("Unscheduled. It’s back where it was.")
    })

  /** Puts a restored version on the canvas: the server already wrote it to the draft. */
  const applyRestored = (next: PostFull) => {
    const nextDoc = docOf(next)
    editor?.commands.setContent(nextDoc, false)
    const normalized = normalizeDoc(editor?.getJSON() ?? nextDoc)
    lastDocKey.current = JSON.stringify(normalized)
    setDoc(normalized)
    setTitle(next.title)
    setExcerpt(next.excerpt ?? "")
    titleRef.current = next.title
    excerptRef.current = next.excerpt ?? ""
    void autosave.clearBackup()
    settle(next)
    setHistoryKey((n) => n + 1)
  }

  const restore = () =>
    void run("restore that version", async () => {
      if (!restoreTarget) return
      applyRestored(await adapter.restoreRevision(restoreTarget.id))
      setRestoreTarget(null)
      setCompare({ open: false, id: null })
      toast.success("Version restored to the draft", { description: "The live post hasn’t changed. Publish to put it live." })
    })

  const sendChanges = () =>
    void run("request changes", async () => {
      settle(await adapter.requestChanges(post.id, changesNote.trim()))
      setChangesOpen(false)
      setChangesNote("")
      adapter.listComments(post.id).then(setComments).catch(() => undefined)
      toast.success("Sent back with your comments")
    })

  const confirmed = () =>
    void run(confirm ?? "do that", async () => {
      if (confirm === "withdraw") settle(await adapter.withdraw(post.id))
      if (confirm === "unpublish") {
        const result = await adapter.unpublish(post.id)
        settle(result.post)
        websiteToast(result.website)
        toast.success("Unpublished. It’s a draft again.")
      }
      if (confirm === "unschedule") {
        settle(await adapter.unschedule(post.id))
        toast.success("Unscheduled. It’s back where it was.")
      }
      if (confirm === "archive") toast.message("Archiving from the editor arrives in the next release. Use Posts.")
      setConfirm(null)
    })

  const preview = async () => {
    const popup = window.open("about:blank", "_blank")
    try {
      await flush()
      const result = await adapter.previewLink(post.id)
      if ("url" in result && popup) popup.location.href = result.url
      else {
        popup?.close()
        toast.message("Preview unavailable", { description: "skipped" in result ? result.skipped : undefined })
      }
    } catch (error) {
      popup?.close()
      toast.error(errorMessage(error, "Couldn’t open the preview."))
    }
  }

  // ---- keyboard -----------------------------------------------------------------------------------------------

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey
      if (!mod) return
      if (event.key === "s") {
        event.preventDefault()
        void flush().then(() => toast.message("Saved"))
      } else if (event.key === ".") {
        event.preventDefault()
        setPanelOpen((open) => !open)
      } else if (event.key.toLowerCase() === "p" && event.shiftKey) {
        event.preventDefault()
        void preview()
      } else if (event.key === "k" && editorRef.current?.isFocused) {
        event.preventDefault()
        setLinkRequest((n) => n + 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flush])

  // ---- render -------------------------------------------------------------------------------------------------

  const coverUrl = fileUrl(post.cover_path)
  const category = lookups.categories.find((item) => item.id === post.category_id)
  const openComments_ = comments.filter((row) => !row.parent_id && !row.resolved_at).length
  const statusKey = post.status === "published" && post.has_unpublished_changes ? "changes_not_published" : post.status
  const dialogLabel = flow.primary === "approve" ? "Approve" : flow.primary === "update" ? "Update live post" : "Publish now"
  const isEditorRole = viewer.role !== "writer"
  const summary = extractSummary(doc)
  const zone = useMemo(() => browserZone(), [])

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-background">
      <TopBar
        backHref={backHref}
        status={statusKey}
        save={autosave.state}
        saveLabel={readOnly ? (lock.state === "busy" || lock.state === "lost" ? `${lock.holder?.name ?? "Someone"} is editing` : "Read-only") : autosave.label}
        commentCount={openComments_}
        panelOpen={panelOpen}
        statusNote={post.status === "scheduled" && post.scheduled_for ? scheduledLine(post.scheduled_for, zone) : null}
        viewers={lock.viewers}
        meId={viewer.id}
        primaryLabel={post.status === "scheduled" ? "Publish now" : undefined}
        onOpenHistory={() => (setPanelOpen(true), setTab("history"))}
        primary={flow.primary}
        secondary={flow.secondary}
        busy={busy}
        onAction={onAction}
        onTogglePanel={() => setPanelOpen((open) => !open)}
        onOpenComments={openComments}
        onPreview={() => void preview()}
      />

      <div className="flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain [container-type:inline-size]" aria-label="Editor">
          <div className="mx-auto w-full max-w-[768px] px-6 pb-48 pt-8">
            <div className="grid gap-3 pb-6">
              <LockBanner lock={lock} />
              {post.status === "scheduled" && post.scheduled_for ? (
                <Banner tone="info" icon={Info}>
                  Scheduled. {scheduledLine(post.scheduled_for, zone)}. The URL is locked until then.
                </Banner>
              ) : null}
              {post.status === "in_review" && isEditorRole && !flow.needsSecondEditor ? (
                <Banner tone="info" icon={Info}>
                  Waiting for your review. Read it, comment on anything that needs work, then approve or request changes.
                </Banner>
              ) : null}
              {post.status === "changes_requested" ? (
                <Banner
                  tone="warning"
                  icon={AlertTriangle}
                  action={
                    <Button type="button" size="sm" variant="outline" onClick={openComments}>
                      Open comments
                    </Button>
                  }
                >
                  An Editor sent this back with comments. Make the changes, then submit it again.
                </Banner>
              ) : null}
              {flagged && post.status !== "published" ? (
                <Banner tone="warning" icon={AlertTriangle}>
                  This post makes claims about {claimLabel(claims.matches.map((m) => m.label), post.claims_matches)}. A second Editor has to approve it before it can be published.
                </Banner>
              ) : null}
              {flow.note && !flagged ? (
                <Banner tone="info" icon={Info}>
                  {flow.note}
                </Banner>
              ) : null}
              {issueCount > 0 && !readOnly ? (
                <Banner tone="warning" icon={AlertTriangle}>
                  {issueCount} {issueCount === 1 ? "block needs" : "blocks need"} attention before this can be published (an empty embed, an image without alt text, a source without a link).
                </Banner>
              ) : null}
            </div>

            <input
              ref={coverInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              aria-label="Choose a cover image"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) void uploadCover(file)
              }}
            />
            <input
              ref={imageInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              multiple
              className="sr-only"
              aria-label="Choose images to insert"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? [])
                event.target.value = ""
                if (files.length) void insertImages(files, null)
              }}
            />

            {coverUrl ? (
              <div className="group relative mb-6 overflow-hidden rounded-xl border border-border bg-muted" style={{ aspectRatio: "16 / 9" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- editor cover preview */}
                <img
                  src={coverUrl}
                  alt={post.cover_alt ?? ""}
                  className="size-full object-cover"
                  style={{ objectPosition: `${(post.cover_focal_point?.x ?? 0.5) * 100}% ${(post.cover_focal_point?.y ?? 0.5) * 100}%` }}
                />
                {!readOnly ? (
                  <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <Button type="button" size="sm" variant="outline" onClick={() => (setPanelOpen(true), setTab("post"))}>
                      Focal point
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => coverInput.current?.click()}>
                      Replace cover
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : !readOnly ? (
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-6 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <ImagePlus className="size-4" aria-hidden />
                Add a cover (required to publish)
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => (setPanelOpen(true), setTab("post"))}
              className={cn(
                "mb-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                category ? "border-border text-foreground" : "border-dashed border-border text-muted-foreground",
              )}
            >
              <Tag className="size-3" aria-hidden />
              {category?.name ?? "Add a category"}
            </button>

            <AutoTextarea
              aria-label="Title"
              placeholder="Post title"
              value={title}
              disabled={readOnly}
              maxLength={200}
              onChange={onTitleChange}
              onEnter={() => document.getElementById("post-dek")?.focus()}
              className="block w-full resize-none overflow-hidden bg-transparent text-[40px] font-semibold leading-[1.15] tracking-[-0.01em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />
            <AutoTextarea
              id="post-dek"
              aria-label="Excerpt"
              placeholder="A one or two sentence dek"
              value={excerpt}
              disabled={readOnly}
              maxLength={400}
              onChange={onExcerptChange}
              onEnter={() => editor?.commands.focus("start")}
              className="mt-3 block w-full resize-none overflow-hidden bg-transparent text-xl leading-8 text-muted-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            />

            <div ref={canvasRef} className="relative mt-8">
              {/* Each in its own wrapper: tippy moves the bubble menu out of the tree, and a conditional sibling next to
                  a moved element makes React's insertBefore fail. */}
              <div>{editor ? <BlockHandle editor={editor} containerRef={canvasRef} /> : null}</div>
              <div>
                {editor ? (
                  <EditorBubbleMenu
                    editor={editor}
                    linkTargets={lookups.linkTargets}
                    linkRequest={linkRequest}
                    onComment={(quote) => {
                      setCommentQuote(quote)
                      openComments()
                    }}
                  />
                ) : null}
              </div>
              <EditorContent editor={editor} />
            </div>
            <span className="sr-only">{summary ? "Has a summary" : "No summary yet"}</span>
          </div>
        </main>

        {panelOpen ? (
          <aside className="flex w-[400px] shrink-0 flex-col overflow-x-hidden border-l border-border bg-card" aria-label="Post settings">
            <Tabs value={tab} onValueChange={(value) => setTab(value as PanelTab)} className="flex min-h-0 flex-1 flex-col">
              <FilterTabs<PanelTab>
                variant="underline"
                ariaLabel="Post settings"
                className="mx-5 shrink-0"
                value={tab}
                onChange={setTab}
                tabs={[
                  { value: "post", label: "Post" },
                  { value: "seo", label: "SEO" },
                  { value: "performance", label: "Performance" },
                  { value: "comments", label: openComments_ ? `Notes ${openComments_}` : "Notes" },
                  { value: "history", label: "History" },
                ]}
              />
              <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain">
                <TabsContent value="post" className="mt-2">
                  <PostTab
                    post={post}
                    title={title}
                    excerpt={excerpt}
                    doc={doc}
                    viewer={viewer}
                    readOnly={readOnly}
                    patch={onSlugPatch}
                    patchSoon={patchSoon}
                    categories={lookups.categories}
                    authors={lookups.authors}
                    onExcerptChange={onExcerptChange}
                    onAuthorsChange={(ids) => void changeAuthors(ids)}
                    significant={significant}
                    onSignificantChange={setSignificant}
                    onUploadCover={uploadCover}
                  />
                </TabsContent>
                <TabsContent value="seo" className="mt-2">
                  <SeoTab post={post} title={title} excerpt={excerpt} readOnly={readOnly} patch={patch} patchSoon={patchSoon} otherPosts={lookups.otherPosts} />
                  <SocialTab post={post} title={title} />
                </TabsContent>
                <TabsContent value="performance" className="mt-2">
                  <PerformanceTab postId={post.id} slug={post.slug} status={post.status} />
                </TabsContent>
                <TabsContent value="comments" className="mt-2 h-full">
                  <CommentsPanel
                    comments={comments}
                    loading={commentsLoading}
                    quote={commentQuote}
                    onClearQuote={() => setCommentQuote(null)}
                    onAdd={addComment}
                    onResolve={resolveComment}
                  />
                </TabsContent>
                <TabsContent value="history" className="mt-2">
                  <HistoryPanel
                    adapter={adapter}
                    postId={post.id}
                    refreshKey={`${post.status}:${post.published_at ?? ""}:${historyKey}`}
                    canRestore={!readOnly}
                    onLoaded={setRevisions}
                    onCompare={(row) => setCompare({ open: true, id: row.id })}
                    onRestore={setRestoreTarget}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </aside>
        ) : null}
      </div>

      <PublishDialog
        key={dialogKey}
        open={publishOpen}
        onOpenChange={setPublishOpen}
        mode={post.published_at ? "update" : "publish"}
        result={checklist}
        review={review ? { ...review, flagged: review.flagged || flagged } : flagged ? { flagged, matches: claims.matches.map((m) => m.label), needed: 2, have: 0, approvals: [], creator: post.created_by, creator_is_editor: false } : null}
        primaryLabel={dialogLabel}
        primaryIsApproval={flow.primary === "approve"}
        pending={busy}
        onConfirm={confirmPublish}
        onItemAction={goToItem}
        canSchedule={isEditorRole && post.status !== "published" && post.status !== "archived" && flow.primary !== "approve"}
        scheduledFor={post.status === "scheduled" ? post.scheduled_for : null}
        startInSchedule={startInSchedule}
        onSchedule={confirmSchedule}
        onUnschedule={unschedule}
      />

      <CompareDialog
        open={compare.open}
        onOpenChange={(open) => setCompare((current) => ({ ...current, open }))}
        adapter={adapter}
        revisions={revisions}
        initialId={compare.id}
        current={{ title, excerpt, doc }}
        canRestore={!readOnly}
        onRestore={setRestoreTarget}
      />

      <ConfirmDialog
        open={restoreTarget !== null}
        onOpenChange={(open) => !open && setRestoreTarget(null)}
        title="Restore this version?"
        description={`The version from ${restoreTarget ? whenLabel(restoreTarget.created_at).replace(/^(Today|Yesterday)/, (word) => word.toLowerCase()) : ""} replaces your current draft. The live post doesn’t change until you publish, and the draft you have now stays in History.`}
        confirmLabel="Restore to draft"
        pending={busy}
        onConfirm={restore}
      />

      <Dialog open={changesOpen} onOpenChange={(open) => !busy && setChangesOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request changes?</DialogTitle>
            <DialogDescription>The post goes back to its writer as “Changes requested”, with your note as a comment.</DialogDescription>
          </DialogHeader>
          <Textarea aria-label="What needs to change" rows={4} placeholder="What needs to change?" value={changesNote} onChange={(event) => setChangesNote(event.target.value)} />
          <DialogFooter className="gap-2 sm:space-x-0">
            <Button type="button" variant="outline" onClick={() => setChangesOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={sendChanges} disabled={busy || !changesNote.trim()}>
              Request changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === "unpublish" ? "Unpublish this post?" : confirm === "archive" ? "Archive this post?" : confirm === "unschedule" ? "Unschedule this post?" : "Withdraw from review?"}
        description={
          confirm === "unpublish"
            ? "It leaves easner.com/blog and becomes a draft again. Its URL stops working until it is published again."
            : confirm === "archive"
              ? "It leaves easner.com/blog and moves to Archived."
              : confirm === "unschedule"
                ? "It won’t go live at the scheduled time. It goes back to the status it had before."
                : "It goes back to Draft and the Editor’s review request is cancelled."
        }
        confirmLabel={confirm === "unpublish" ? "Unpublish" : confirm === "archive" ? "Archive" : confirm === "unschedule" ? "Unschedule" : "Withdraw"}
        tone={confirm === "unpublish" || confirm === "archive" ? "destructive" : "default"}
        pending={busy}
        onConfirm={confirmed}
      />

      <AltTextDialog open={altRequest !== null} src={altRequest?.src ?? null} onSave={saveAlt} onSkip={() => setAltRequest(null)} />
    </div>
  )
}

function claimLabel(live: string[], saved: string[]): string {
  const labels = [...new Set(live)]
  if (labels.length) return labels.slice(0, 3).join(", ").toLowerCase()
  return saved.length ? saved.join(", ").toLowerCase() : "fees, rates or regulation"
}

function Banner({
  tone,
  icon: Icon,
  children,
  action,
}: {
  tone: "info" | "warning"
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm",
        tone === "info" ? "bg-info-surface text-info-text" : "bg-warning-surface text-warning-text",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  )
}
