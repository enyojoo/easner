import { notFound } from "next/navigation"
import { cropImage, jpegResponse } from "@/lib/blog/crop"
import { getAuthor, getAuthors } from "@/lib/blog/queries"

/** The author's photo as a square JPEG on www.easner.com, for `Person.image`. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAuthors()).filter((a) => a.avatarPath).map((a) => ({ slug: a.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author?.avatarPath) notFound()
  const buffer = await cropImage(author.avatarPath, null, 800, 800)
  if (!buffer) notFound()
  return jpegResponse(buffer)
}
