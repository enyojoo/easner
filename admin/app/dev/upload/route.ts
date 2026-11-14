import { devHarnessEnabled } from "@/lib/dev-harness"

/** Stands in for Supabase Storage in the harness: keeps uploads in memory and serves them back. Development only. */
const store = ((globalThis as unknown as { __harnessUploads?: Map<string, { type: string; bytes: ArrayBuffer }> }).__harnessUploads ??= new Map())

export async function POST(request: Request) {
  if (!devHarnessEnabled()) return new Response("Not found", { status: 404 })
  const form = await request.formData()
  const file = form.get("file")
  if (!(file instanceof File)) return Response.json({ error: "No file." }, { status: 400 })
  const id = crypto.randomUUID()
  store.set(id, { type: file.type, bytes: await file.arrayBuffer() })
  return Response.json({ id, url: `/dev/upload?id=${id}` })
}

export function GET(request: Request) {
  if (!devHarnessEnabled()) return new Response("Not found", { status: 404 })
  const item = store.get(new URL(request.url).searchParams.get("id") ?? "")
  if (!item) return new Response("Not found", { status: 404 })
  return new Response(item.bytes, { headers: { "content-type": item.type, "cache-control": "no-store" } })
}
