"use client"

import { Check, ThumbsDown, ThumbsUp } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const REASONS = [
  { value: "out_of_date", label: "Out of date" },
  { value: "missing_my_country", label: "Missing my country" },
  { value: "not_what_i_was_looking_for", label: "Not what I was looking for" },
  { value: "too_technical", label: "Too technical" },
] as const

type State = "idle" | "no" | "thanks"

/**
 * "Was this helpful?" (WebPostFeedback). Yes / No, then an optional one-tap reason after No. No login, one vote per
 * browser per post (remembered in this browser, enforced server-side per day), no public counts.
 */
export function Helpful({ slug }: { slug: string }) {
  const key = `easner:blog:helpful:${slug}`
  const [state, setState] = useState<State>("idle")
  const [reason, setReason] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(key)
      // Reading the stored vote after hydration (it can't be read during server render).
      /* eslint-disable react-hooks/set-state-in-effect */
      if (saved === "yes" || saved === "done") setState("thanks")
      else if (saved === "no") setState("no")
      /* eslint-enable react-hooks/set-state-in-effect */
    } catch {
      /* storage blocked */
    }
  }, [key])

  const send = (helpful: boolean, why?: string) =>
    fetch("/api/blog/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, helpful, reason: why }),
      keepalive: true,
    }).catch(() => {})
  const remember = (value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* storage blocked */
    }
  }

  return (
    <div className="bp-help" aria-live="polite">
      {state === "thanks" ? (
        <p className="bp-ty">
          <Check size={18} aria-hidden="true" /> Thanks. This helps us improve the post.
        </p>
      ) : (
        <>
          <div className="q">
            <span id={`helpful-${slug}`}>Was this helpful?</span>
            <span className="yn" role="group" aria-labelledby={`helpful-${slug}`}>
              <button
                type="button"
                className="bp-yb"
                onClick={() => {
                  setState("thanks")
                  remember("yes")
                  void send(true)
                }}
              >
                <ThumbsUp size={16} aria-hidden="true" /> Yes
              </button>
              <button
                type="button"
                className={cn("bp-yb", state === "no" && "on")}
                aria-pressed={state === "no"}
                onClick={() => {
                  if (state === "no") return
                  setState("no")
                  remember("no")
                  void send(false)
                }}
              >
                <ThumbsDown size={16} aria-hidden="true" /> No
              </button>
            </span>
          </div>
          {state === "no" && (
            <div className="bp-rs" role="group" aria-label="What was wrong? (optional)">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  className={cn("bp-rc", reason === r.value && "on")}
                  aria-pressed={reason === r.value}
                  onClick={() => {
                    setReason(r.value)
                    setState("thanks")
                    remember("done")
                    void send(false, r.value)
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
