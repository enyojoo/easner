import { devHarnessEnabled } from "@/lib/dev-harness"

/** Stands in for Supabase Storage in the harness: keeps uploads in memory and serves them back. Development only. */
type Upload = { type: string; bytes: ArrayBuffer }
// Created lazily inside the development-only branches below, so production builds carry none of it.
const memory = () => ((globalThis as unknown as { __harnessUploads?: Map<string, Upload> }).__harnessUploads ??= new Map())

const notFound = () => new Response("Not found", { status: 404 })

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "development" && devHarnessEnabled()) {
    const form = await request.formData()
    const file = form.get("file")
    if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 })
    const id = crypto.randomUUID()
    memory().set(id, { type: file.type, bytes: await file.arrayBuffer() })
    return Response.json({ id, url: `/dev/upload?id=${id}` })
  }
  return notFound()
}

export function GET(request: Request) {
  if (process.env.NODE_ENV === "development" && devHarnessEnabled()) {
    const item = memory().get(new URL(request.url).searchParams.get("id") ?? "")
    if (!item) return notFound()
    return new Response(item.bytes, { headers: { "content-type": item.type, "cache-control": "no-store" } })
  }
  return notFound()
}
