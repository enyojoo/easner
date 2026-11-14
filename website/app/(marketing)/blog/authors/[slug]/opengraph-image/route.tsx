import { notFound } from "next/navigation"
import { cropImage } from "@/lib/blog/crop"
import { getAuthor, getAuthors } from "@/lib/blog/queries"
import { textCardResponse } from "@/lib/blog/share-card"

/** Author share image: their photo on the brand panel with their name; the Easner mark when there is no photo. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getAuthors()).map((a) => ({ slug: a.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const square = author.avatarPath ? await cropImage(author.avatarPath, null, 640, 640) : null
  return textCardResponse({
    label: "Blog · Author",
    title: author.name,
    line: author.title ?? undefined,
    photo: square ? `data:image/jpeg;base64,${square.toString("base64")}` : null,
  })
}
