"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { APP_DOWNLOAD_API_URL } from "@/lib/download-routing"
import { posthog } from "@/lib/posthog"
import { captureCtaClicked, captureFormSubmitted } from "@/lib/marketing/analytics"
import { cn } from "@/lib/utils"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface DownloadEmailFormProps {
  className?: string
  src?: string
  analyticsLocation?: string
  onSuccess?: () => void
}

type FormStatus = "idle" | "loading" | "success" | "error"

export function DownloadEmailForm({ className, src, analyticsLocation, onSuccess }: DownloadEmailFormProps) {
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
        const location = analyticsLocation ?? (src ? `${src}_download_email` : "download_email")
        posthog.capture("download_link_email_sent", { src: src ?? null })
        captureFormSubmitted("download_link_email", { src: src ?? null })
        captureCtaClicked({
          cta_location: location,
          cta_label: "Send download link",
          destination: "download_link_email",
          destination_type: "download",
        })
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
      <p className={cn("text-center text-sm leading-6 text-web-nav", className)} role="status">
        Check your inbox – we sent your download link.
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
          className="h-12 min-w-0 flex-1 rounded-[12px] border border-web-hairline bg-web-plate px-4 text-[15px] text-web-ink placeholder:text-web-meta focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/25 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!canSubmit}
          aria-label="Send download link"
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-primary text-web-band transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "loading" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ArrowRight className="size-5" strokeWidth={2.25} />
          )}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-center text-sm text-destructive-text" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
