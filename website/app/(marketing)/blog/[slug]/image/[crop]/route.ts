import { notFound } from "next/navigation"
import { cropImage, jpegResponse } from "@/lib/blog/crop"
import { getPost, getPostSlugs } from "@/lib/blog/queries"
import { CROPS, type CropName } from "@/lib/blog/urls"

/** Cover crops for `BlogPosting.image`: 16:9, 4:3 and 1:1, cut around the focal point, on www.easner.com. */
export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getPostSlugs()
  return slugs.flatMap((slug) => (Object.keys(CROPS) as CropName[]).map((crop) => ({ slug, crop })))
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; crop: string }> }) {
  const { slug, crop } = await params
  if (!(crop in CROPS)) notFound()
  const post = await getPost(slug)
  if (!post?.coverPath) notFound()
  const { width, height } = CROPS[crop as CropName]
  const buffer = await cropImage(post.coverPath, post.coverFocal, width, height)
  if (!buffer) notFound()
  return jpegResponse(buffer)
}
