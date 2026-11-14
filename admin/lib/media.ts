import { validateUpload } from "@/lib/blog/crops"
import { SUPABASE_URL, blogFileUrl, supabase } from "@/lib/supabase"

/** Uploads and descriptions for the `blog` Storage bucket and the `blog_media` table (plan §4, Media library). */

export type BlogMedia = {
  id: string
  path: string
  url: string
  width: number | null
  height: number | null
  mime: string
  size: number | null
  alt: string | null
  caption: string | null
}

export type UploadFolder = "posts" | "authors" | "categories" | "media"

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
}

function fileSlug(name: string): string {
  const base = name.replace(/\.[^.]+$/, "")
  return (
    base
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image"
  )
}

export function readImageSize(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("This file isn’t an image we can read."))
    }
    img.src = url
  })
}

async function putObject(path: string, file: Blob, mime: string, onProgress?: (fraction: number) => void) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("You’re signed out. Sign in again to upload.")
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/blog/${path.split("/").map(encodeURIComponent).join("/")}`)
    xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.setRequestHeader("apikey", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "")
    xhr.setRequestHeader("x-upsert", "false")
    xhr.setRequestHeader("Content-Type", mime)
    xhr.setRequestHeader("cache-control", "max-age=31536000")
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let message = "The upload failed. Try again."
      try {
        const body = JSON.parse(xhr.responseText) as { message?: string }
        if (/row-level security|unauthorized/i.test(body.message ?? "")) message = "You don’t have permission to upload here."
        else if (/mime|not supported/i.test(body.message ?? "")) message = "Use a JPG, PNG, WebP, AVIF or GIF image."
        else if (/exceeded|too large|maximum/i.test(body.message ?? "")) message = "This file is over the 20 MB limit."
      } catch {
        // keep the default message
      }
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error("You look offline. Check your connection and try again."))
    xhr.send(file)
  })
}

export async function uploadBlogImage(
  file: File,
  opts: { folder: UploadFolder; postId?: string; alt?: string; onProgress?: (fraction: number) => void },
): Promise<BlogMedia> {
  const problem = validateUpload(file)
  if (problem) throw new Error(problem)
  const { width, height } = await readImageSize(file)

  const ext = EXT[file.type] ?? "jpg"
  const stamp = Date.now().toString(36)
  const name = `${stamp}-${fileSlug(file.name)}.${ext}`
  const dir = opts.folder === "posts" && opts.postId ? `posts/${opts.postId}` : opts.folder === "posts" ? "posts/unsorted" : opts.folder
  const path = `${dir}/${name}`

  opts.onProgress?.(0)
  await putObject(path, file, file.type, opts.onProgress)
  opts.onProgress?.(1)

  const { data, error } = await supabase
    .from("blog_media")
    .insert({ path, width, height, mime: file.type, size: file.size, alt: opts.alt?.trim() || null })
    .select("id, path, width, height, mime, size, alt, caption")
    .single()
  if (error) {
    // Don't leave an orphan file behind when the row is refused.
    await supabase.storage.from("blog").remove([path])
    throw error
  }
  return { ...(data as Omit<BlogMedia, "url">), url: blogFileUrl(path) ?? "" }
}

export async function updateMediaAlt(id: string, alt: string, caption?: string | null): Promise<void> {
  const patch: { alt: string | null; caption?: string | null } = { alt: alt.trim() || null }
  if (caption !== undefined) patch.caption = caption?.trim() || null
  const { error } = await supabase.from("blog_media").update(patch).eq("id", id)
  if (error) throw error
}

/** Uploads a cropped square (a Blob from a canvas) as an author photo and returns its storage path. */
export async function uploadAvatarBlob(blob: Blob, name: string): Promise<BlogMedia> {
  const file = new File([blob], `${fileSlug(name)}.jpg`, { type: "image/jpeg" })
  return uploadBlogImage(file, { folder: "authors", alt: name })
}
