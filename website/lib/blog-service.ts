import { supabase } from "./supabase"

export interface BlogAuthor {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface BlogTopic {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  body: string
  cover_image_url: string | null
  author_id: string
  topic_id: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  author?: BlogAuthor
  topic?: BlogTopic
}

export async function getPublishedPosts(options?: {
  topicSlug?: string
  limit?: number
  offset?: number
}): Promise<BlogPost[]> {
  let query = supabase
    .from("blog_posts")
    .select(`
      *,
      author:blog_authors(*),
      topic:blog_topics(*)
    `)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })

  if (options?.topicSlug) {
    const { data: topic } = await supabase
      .from("blog_topics")
      .select("id")
      .eq("slug", options.topicSlug)
      .single()
    if (topic) {
      query = query.eq("topic_id", topic.id)
    }
  }

  if (options?.limit !== undefined) {
    if (options?.offset !== undefined) {
      query = query.range(options.offset, options.offset + options.limit - 1)
    } else {
      query = query.limit(options.limit)
    }
  }

  const { data, error } = await query
  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
  return (data || []) as BlogPost[]
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      author:blog_authors(*),
      topic:blog_topics(*)
    `)
    .eq("slug", slug)
    .not("published_at", "is", null)
    .lte("published_at", new Date().toISOString())
    .single()

  if (error || !data) {
    return null
  }
  return data as BlogPost
}

export async function getTopics(): Promise<BlogTopic[]> {
  const { data, error } = await supabase
    .from("blog_topics")
    .select("*")
    .order("sort_order", { ascending: true })

  if (error) {
    console.error("Error fetching blog topics:", error)
    return []
  }
  return (data || []) as BlogTopic[]
}
