import { notFound } from "next/navigation"
import { getCategories, getCategory } from "@/lib/blog/queries"
import { richPlain } from "@/lib/blog/seo-text"
import { shareImageResponse } from "@/lib/blog/share-card"

/** Category share image: its uploaded art (`og_art_path`) cropped to 1200×630, else the text card. */
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getCategories()).map((c) => ({ slug: c.slug }))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()
  return shareImageResponse(
    { path: category.ogArtPath, focal: null },
    { label: "Blog", title: category.name, line: (category.description || richPlain(category.intro)).slice(0, 110) },
  )
}
