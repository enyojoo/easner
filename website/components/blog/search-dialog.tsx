"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Search, SearchX } from "lucide-react"
import { formatDate, readTime } from "@/lib/blog/format"
import { cn } from "@/lib/utils"
import { CoverImage } from "./cover-image"

export interface SearchPost {
  slug: string
  title: string
  excerpt: string
  categoryName: string
  coverPath: string | null
  coverFocal: { x: number; y: number } | null
  publishedAt: string
  readingMinutes: number
}
interface SearchAnswer {
  question: string
  href: string
}
interface SearchResult {
  posts: SearchPost[]
  answers: SearchAnswer[]
}

const Ctx = createContext<{ open: () => void } | null>(null)

/** Opens the blog search dialog from anywhere under the blog layout. Falls back to a no-op outside it. */
export function useBlogSearch() {
  return useContext(Ctx) ?? { open: () => {} }
}

function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return <>{text}</>
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi")
  return (
    <>
      {text.split(pattern).map((part, i) => (i % 2 === 1 ? <mark key={i}>{part}</mark> : <span key={i} className="!text-inherit">{part}</span>))}
    </>
  )
}

/** WebBlogSearch (design system): ⌘K, `/` or the search button. Full screen on phones. */
export function BlogSearchProvider({
  children,
  categories,
  popular,
}: {
  children: ReactNode
  categories: { slug: string; name: string }[]
  popular: SearchPost[]
}) {
  const router = useRouter()
  const [isOpen, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [index, setIndex] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const open = useCallback(() => {
    returnFocus.current = document.activeElement as HTMLElement | null
    setOpen(true)
  }, [])
  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
    setResult(null)
    returnFocus.current?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        if (isOpen) close()
        else open()
      } else if (event.key === "/" && !typing && !isOpen && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        open()
      } else if (event.key === "Escape" && isOpen) {
        close()
      } else if (event.key === "Tab" && isOpen) {
        // aria-modal: keep Tab inside the dialog.
        const focusable = dialog.current?.querySelectorAll<HTMLElement>("input, button, a[href]")
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement
        if (event.shiftKey && (active === first || !dialog.current?.contains(active))) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && (active === last || !dialog.current?.contains(active))) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen, open, close])

  useEffect(() => {
    if (!isOpen) return
    input.current?.focus()
    const { body } = document
    const previous = body.style.overflow
    body.style.overflow = "hidden"
    return () => {
      body.style.overflow = previous
    }
  }, [isOpen])

  // Results update as you type, 150ms debounce. The query is not put in the URL (search pages are not indexed).
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/blog/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        if (response.ok) {
          setResult((await response.json()) as SearchResult)
          setIndex(0)
        }
      } catch {
        /* aborted or offline: keep the previous results */
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 150)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  const words = useMemo(() => query.trim().split(/\s+/).filter((w) => w.length > 1), [query])
  const hits = useMemo(
    () => [
      ...(result?.posts ?? []).map((post) => ({ href: `/blog/${post.slug}`, key: post.slug })),
      ...(result?.answers ?? []).map((answer) => ({ href: answer.href, key: answer.question })),
    ],
    [result],
  )

  const onInputKey = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setIndex((i) => Math.min(i + 1, Math.max(0, hits.length - 1)))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === "Enter" && hits[index]) {
      event.preventDefault()
      router.push(hits[index].href)
      close()
    }
  }

  const value = useMemo(() => ({ open }), [open])
  const showing = query.trim() !== ""

  return (
    <Ctx.Provider value={value}>
      {children}
      {isOpen && (
        <div className="bs-scrim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div ref={dialog} className="bs-dlg" role="dialog" aria-modal="true" aria-label="Search the blog">
            <div className="bs-field">
              <Search className="size-[18px] shrink-0 text-web-meta" aria-hidden="true" />
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search the blog"
                aria-label="Search the blog"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="bs-results"
                aria-autocomplete="list"
                aria-activedescendant={hits[index] ? `bs-hit-${index}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" className="bs-esc" onClick={close} aria-label="Close search">
                Esc
              </button>
            </div>
            <div className="bs-body" id="bs-results" role={showing ? "listbox" : undefined} aria-label="Search results" aria-live="polite">
              {!showing && (
                <>
                  <span className="bs-grp">Categories</span>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/blog/categories/${c.slug}`}
                        onClick={close}
                        className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-web-nav shadow-[inset_0_0_0_1px_var(--web-hairline)] hover:text-web-ink"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                  {popular.length > 0 && <span className="bs-grp">Popular</span>}
                  {popular.map((post) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} onClick={close} className="group flex items-center gap-4 rounded-md">
                      <div className="w-[120px] shrink-0 overflow-hidden rounded-md border border-web-hairline">
                        <CoverImage path={post.coverPath} alt={null} focal={post.coverFocal} sizes="120px" width={240} height={135} />
                      </div>
                      <div className="grid min-w-0 gap-1.5">
                        <span className="text-xs font-semibold uppercase leading-4 tracking-[0.08em] text-primary-text">{post.categoryName}</span>
                        <span className="line-clamp-2 text-[15px] font-semibold leading-[22px] text-web-ink group-hover:text-primary-text">{post.title}</span>
                        <span className="text-[13px] leading-[18px] text-web-meta">
                          {formatDate(post.publishedAt)} · {readTime(post.readingMinutes)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {showing && result && result.posts.length > 0 && (
                <>
                  <span className="bs-grp">{result.posts.length} {result.posts.length === 1 ? "post" : "posts"}</span>
                  {result.posts.map((post, i) => (
                    <Link key={post.slug} id={`bs-hit-${i}`} href={`/blog/${post.slug}`} onClick={close} onMouseEnter={() => setIndex(i)} role="option" aria-selected={i === index} className={cn("bs-res", i === index && "on")}>
                      <b><Highlight text={post.title} words={words} /></b>
                      <span>
                        {post.categoryName} · <Highlight text={post.excerpt} words={words} />
                      </span>
                    </Link>
                  ))}
                </>
              )}
              {showing && result && result.answers.length > 0 && (
                <>
                  <span className="bs-grp">Answers</span>
                  {result.answers.map((answer, i) => {
                    const at = result.posts.length + i
                    return (
                      <Link key={answer.question} id={`bs-hit-${at}`} href={answer.href} onClick={close} onMouseEnter={() => setIndex(at)} role="option" aria-selected={at === index} className={cn("bs-res", at === index && "on")}>
                        <b><Highlight text={answer.question} words={words} /></b>
                        <span>From easner.com/answers</span>
                      </Link>
                    )
                  })}
                </>
              )}
              {showing && result && hits.length === 0 && !loading && (
                <div className="bs-empty">
                  <span className="ci"><SearchX className="size-5" aria-hidden="true" /></span>
                  <b>No posts match &ldquo;{query.trim()}&rdquo;</b>
                  <p>Try a country, a currency or a product, like Kenya, EUR or Payroll.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("")
                      input.current?.focus()
                    }}
                    className="inline-flex h-9 items-center rounded-full px-4 text-sm font-medium text-web-nav shadow-[inset_0_0_0_1px_var(--web-hairline)] hover:text-web-ink"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
            <div className="bs-ft">
              <span>↑↓ to move</span>
              <span>↵ to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}

/** The pill in the category bar: "Search the blog" with the ⌘K hint. */
export function SearchButton({ className }: { className?: string }) {
  const { open } = useBlogSearch()
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "inline-flex h-11 min-w-0 md:h-9 items-center gap-2 rounded-full bg-web-plate pl-3 pr-2.5 text-sm text-web-meta shadow-[inset_0_0_0_1px_var(--web-hairline)] transition-colors hover:text-web-ink md:min-w-[220px]",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">Search the blog</span>
      <kbd className="ml-auto hidden h-[22px] items-center rounded-md border border-web-hairline bg-web-canvas px-1.5 font-sans text-xs font-medium md:inline-flex">⌘K</kbd>
    </button>
  )
}
