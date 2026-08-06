"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { APP_DOWNLOAD_API_URL } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DownloadEmailFormProps {
  className?: string
  src?: string
  onSuccess?: () => void
}

type FormStatus = "idle" | "loading" | "success" | "error"

export function DownloadEmailForm({ className, src, onSuccess }: DownloadEmailFormProps) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<FormStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState("")

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (honeypot) {
      setStatus("success")
      return
    }

    const trimmed = email.trim().toLowerCase()
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error")
      setError("Enter a valid email address.")
      return
    }

    setStatus("loading")

    try {
      const res = await fetch(APP_DOWNLOAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, ...(src ? { src } : {}) }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; code?: string }

      if (res.status === 429 || data.code === "RATE_LIMITED") {
        setStatus("error")
        setError(data.error ?? "Too many requests. Try again later.")
        return
      }

      if (data.ok) {
        setStatus("success")
        posthog.capture("download_link_email_sent", { src: src ?? null })
        onSuccess?.()
        return
      }

      setStatus("error")
      setError(data.error ?? "Something went wrong. Please try again.")
    } catch {
      setStatus("error")
      setError("Something went wrong. Please try again.")
    }
  }

  if (status === "success") {
    return (
      <p className={cn("text-center text-sm leading-6 text-[#3D403D]", className)} role="status">
        Check your inbox — we sent your download link.
      </p>
    )
  }

  const canSubmit = email.trim().length > 0 && status !== "loading"

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <label htmlFor="download-email" className="sr-only">
        Email address
      </label>
      <div className="flex items-center gap-2">
        <input
          id="download-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Mobile email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === "error") {
              setStatus("idle")
              setError(null)
            }
          }}
          disabled={status === "loading"}
          className="h-12 min-w-0 flex-1 rounded-xl border border-[#E9E4D8] bg-[#F8F6F0] px-4 text-[15px] text-[#0F1110] placeholder:text-[#6F756F] focus:border-[#007ACC] focus:outline-none focus:ring-2 focus:ring-[#007ACC]/25 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send download link"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-[#007ACC] text-[#F6F3EB] transition-colors hover:bg-[#0062A3] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ArrowRight className="size-5" strokeWidth={2.25} />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-center text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
