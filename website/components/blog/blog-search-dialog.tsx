"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, FileText, X } from "lucide-react"
import type { BlogPost } from "@/lib/blog-service"

interface BlogSearchDialogProps {
  posts: BlogPost[]
  open: boolean
  onClose: () => void
}

export function BlogSearchDialog({ posts, open, onClose }: BlogSearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? posts.filter(
        (p) =>
          p.title.toLowerCase().includes(query.toLowerCase()) ||
          (p.excerpt?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : posts
  const suggestions = filtered.slice(0, 10)

  const openDialog = useCallback(() => {
    setQuery("")
    setSelectedIndex(0)
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (open) {
      openDialog()
    }
  }, [open, openDialog])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === "Enter" && suggestions[selectedIndex]) {
        e.preventDefault()
        router.push(`/blog/${suggestions[selectedIndex].slug}`)
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose, suggestions, selectedIndex, router])

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({
      block: "nearest",
    })
  }, [selectedIndex])

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-dialog-title"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="search-dialog-title" className="text-lg font-semibold text-gray-900">
            What are you searching for?
          </h2>
          <span className="text-xs text-gray-500">Esc</span>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:border-easner-primary focus:outline-none focus:ring-2 focus:ring-easner-primary/20"
            autoFocus
          />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Suggestions</h3>
          <div
            ref={listRef}
            className="max-h-64 overflow-y-auto rounded-lg border border-gray-200"
          >
            {suggestions.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No posts found</p>
            ) : (
              suggestions.map((post, i) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  data-index={i}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    i === selectedIndex
                      ? "bg-easner-primary text-white"
                      : "hover:bg-gray-50 text-gray-900"
                  }`}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="line-clamp-1">{post.title}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
