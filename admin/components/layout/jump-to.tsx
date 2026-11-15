"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { skipToken, useQuery } from "@tanstack/react-query"
import { CornerDownLeft, FileText, FolderOpen, Search } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { adminNavLinks, settingsTabs } from "@/lib/nav-config"
import { adminKeys, type CategoryRow, type PostRow } from "@/lib/queries"
import { ADMIN_JUMP_RECENTS_KEY } from "@/lib/query/web-persist"
import { cn } from "@/lib/utils"

/** Jump to (⌘K), Office's command palette: pages, posts and categories from the cached lists. Recent items first. */

type JumpKind = "page" | "post" | "category"

type JumpTarget = {
  key: string
  kind: JumpKind
  label: string
  href: string
  secondary?: string
  mono?: boolean
}

const RECENTS_MAX = 5
const GROUP_MAX = 6

function readRecents(): JumpTarget[] {
  try {
    const raw = window.localStorage.getItem(ADMIN_JUMP_RECENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (item): item is JumpTarget =>
          Boolean(item) && typeof item.href === "string" && typeof item.label === "string" && typeof item.key === "string",
      )
      .slice(0, RECENTS_MAX)
  } catch {
    return []
  }
}

function writeRecent(target: JumpTarget): void {
  try {
    const next = [target, ...readRecents().filter((item) => item.key !== target.key)].slice(0, RECENTS_MAX)
    window.localStorage.setItem(ADMIN_JUMP_RECENTS_KEY, JSON.stringify(next))
  } catch {
    // Recents are a convenience; private windows and blocked storage are fine.
  }
}

const KIND_ICON = { page: Search, post: FileText, category: FolderOpen } as const

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT"
}

/** Focuses the page's list search (`/`). Returns false when the page has none. */
export function focusListSearch(): boolean {
  const input = document.querySelector<HTMLInputElement>('[data-slot="search-field"] input')
  if (!input) return false
  input.focus()
  input.select()
  return true
}

/** Opens Jump to on Cmd/Ctrl+K from anywhere. `/` focuses the page's list search, and opens Jump to where there is none. */
export function useJumpToHotkey(onOpen: () => void): void {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.altKey) {
        event.preventDefault()
        onOpen()
        return
      }
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isEditableTarget(event.target)) return
      if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) return
      event.preventDefault()
      if (!focusListSearch()) onOpen()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onOpen])
}

const GO_TO_ROUTES: Record<string, string> = {
  o: "/overview",
  p: "/posts",
  c: "/settings/categories",
  s: "/settings",
}

/** `g` then `o`, `p`, `c` or `s` goes to Overview, Posts, Categories or Settings. Ignored while typing. */
export function useGoToShortcuts(): void {
  const router = useRouter()
  React.useEffect(() => {
    let armedAt = 0
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isEditableTarget(event.target)) return
      if (document.querySelector('[role="dialog"], [role="menu"], [role="listbox"]')) {
        armedAt = 0
        return
      }
      const key = event.key.toLowerCase()
      if (key === "g") {
        armedAt = Date.now()
        return
      }
      const route = GO_TO_ROUTES[key]
      if (route && armedAt && Date.now() - armedAt < 1200) {
        event.preventDefault()
        router.push(route)
      }
      armedAt = 0
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [router])
}

/** Reads a query that other screens fill. It never fetches: Jump to adds no network calls. */
function useCachedList<T>(queryKey: readonly unknown[]): T | undefined {
  return useQuery({ queryKey, queryFn: skipToken, staleTime: Infinity }).data as T | undefined
}

function matches(q: string, ...fields: Array<string | null | undefined>): boolean {
  return fields.some((field) => field && field.toLowerCase().includes(q))
}

export function JumpTo({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [recents, setRecents] = React.useState<JumpTarget[]>([])
  const posts = useCachedList<PostRow[]>(adminKeys.posts())
  const categories = useCachedList<CategoryRow[]>(adminKeys.categories())

  // Reset when the palette opens (adjusting state during render, not in an effect).
  const [wasOpen, setWasOpen] = React.useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setRecents(readRecents())
    }
  }

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const pages: JumpTarget[] = adminNavLinks
      .filter((item) => !q || matches(q, item.name, ...(item.keywords ?? [])))
      .map((item) => ({ key: `page:${item.href}`, kind: "page", label: item.name, href: item.href }))
    // The Settings tabs are pages of their own for search ("media" finds Settings, Media).
    if (q) {
      for (const tab of settingsTabs) {
        if (tab.value !== "team" && matches(q, tab.label, ...tab.keywords)) {
          pages.push({ key: `page:${tab.href}`, kind: "page", label: tab.label, href: tab.href, secondary: "Settings" })
        }
      }
    }
    if (!q) return { recents, pages, posts: [] as JumpTarget[], categories: [] as JumpTarget[] }
    const postTargets: JumpTarget[] = (posts ?? [])
      .filter((post) => matches(q, post.title, post.slug))
      .slice(0, GROUP_MAX)
      .map((post) => ({
        key: `post:${post.id}`,
        kind: "post",
        label: post.title || "Untitled",
        href: `/posts?q=${encodeURIComponent(post.slug)}`,
        secondary: post.slug,
        mono: true,
      }))
    const categoryTargets: JumpTarget[] = (categories ?? [])
      .filter((category) => matches(q, category.name, category.slug))
      .slice(0, GROUP_MAX)
      .map((category) => ({
        key: `category:${category.id}`,
        kind: "category",
        label: category.name,
        href: `/categories?open=${encodeURIComponent(category.slug)}`,
        secondary: category.slug,
        mono: true,
      }))
    return { recents: [] as JumpTarget[], pages, posts: postTargets, categories: categoryTargets }
  }, [query, recents, posts, categories])

  const go = (target: JumpTarget) => {
    writeRecent(target)
    onOpenChange(false)
    router.push(target.href)
  }

  const renderGroup = (heading: string, items: JumpTarget[]) =>
    items.length ? (
      <CommandGroup
        heading={heading}
        className="[&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.08em]"
      >
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind]
          return (
            <CommandItem
              key={`${heading}:${item.key}`}
              value={`${heading}:${item.key}`}
              onSelect={() => go(item)}
              className="h-11 gap-3 px-3 py-0"
            >
              <Icon className="size-[18px] stroke-[1.5]" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
              {item.secondary ? (
                <span
                  className={cn(
                    "ml-auto max-w-[220px] truncate text-[13px] text-muted-foreground",
                    item.mono && "font-mono text-xs",
                  )}
                >
                  {item.secondary}
                </span>
              ) : null}
            </CommandItem>
          )
        })}
      </CommandGroup>
    ) : null

  const total = results.recents.length + results.pages.length + results.posts.length + results.categories.length

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Jump to"
      description="Search pages, posts and categories."
      showCloseButton={false}
      className="top-14 max-w-[560px] translate-y-0 rounded-xl bg-popover"
      shouldFilter={false}
    >
      <CommandInput
        value={query}
        onValueChange={setQuery}
        placeholder="Jump to…"
        aria-label="Jump to"
        className="text-base"
      />
      <CommandList className="max-h-[360px] p-1">
        {total === 0 ? (
          <CommandEmpty>{`No results for “${query.trim()}”`}</CommandEmpty>
        ) : (
          <>
            {renderGroup("Recent", results.recents)}
            {renderGroup("Posts", results.posts)}
            {renderGroup("Categories", results.categories)}
            {renderGroup("Pages", results.pages)}
          </>
        )}
      </CommandList>
      <div className="flex h-10 items-center gap-4 border-t border-border/60 bg-muted/40 px-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          Move
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>
            <CornerDownLeft className="size-3" aria-hidden="true" />
          </Kbd>
          Open
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Kbd>Esc</Kbd>
          Close
        </span>
      </div>
    </CommandDialog>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-card px-1 text-[11px] font-medium text-foreground">
      {children}
    </kbd>
  )
}

/** The header field: a 36px pill that opens Jump to. */
export const JumpToTrigger = React.forwardRef<HTMLButtonElement, { onClick: () => void; className?: string }>(
  function JumpToTrigger({ onClick, className }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label="Jump to"
        aria-keyshortcuts="Meta+K Control+K"
        className={cn(
          "flex h-9 w-80 max-w-full items-center gap-2 rounded-full border border-input bg-card px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Search className="size-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">Jump to…</span>
        <kbd className="inline-flex h-5 items-center rounded border border-border px-1.5 text-[11px] font-medium">⌘K</kbd>
      </button>
    )
  },
)
