import { supabase } from "./supabase"

const API_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export async function officeFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`
  const headers = new Headers(options.headers || {})

  if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
    headers.set("Content-Type", "application/json")
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`)
  }

  const isSameOrigin = typeof window !== "undefined" && url.startsWith(window.location.origin)
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: isSameOrigin ? "include" : "omit",
  }

  return fetch(url, fetchOptions)
}
