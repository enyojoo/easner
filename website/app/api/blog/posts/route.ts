import { NextRequest } from "next/server"
import { getPublishedPosts } from "@/lib/blog-service"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get("topic") || undefined
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "6", 10)
  const offset = (page - 1) * limit

  const posts = await getPublishedPosts({ topicSlug: topic, limit, offset })
  return Response.json(posts)
}
