/**
 * Fire-and-forget PostHog capture from middleware (Edge-compatible).
 * Never include PII (email addresses).
 */
export async function captureDownloadRedirect(properties: {
  platform: string
  destination: string
  src?: string | null
  entry_host: string
  entry_path: string
}): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return

  const apiHost = host.replace(/\/$/, "")

  try {
    await fetch(`${apiHost}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        event: "download_redirect",
        properties: {
          ...properties,
          distinct_id: `anon_${properties.entry_host}`,
          $lib: "easner-website-middleware",
        },
        timestamp: new Date().toISOString(),
      }),
      // Don't block redirects if PostHog is slow
      signal: AbortSignal.timeout(2000),
    })
  } catch {
    // Ignore analytics failures
  }
}
