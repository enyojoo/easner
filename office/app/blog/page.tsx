"use client"

import { useState, useEffect } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  published_at: string | null
  created_at: string
  author?: { name: string }
  topic?: { name: string }
}

export default function OfficeBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [])

  async function loadPosts() {
    setLoading(true)
    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        id, slug, title, excerpt, published_at, created_at,
        author:blog_authors(name),
        topic:blog_topics(name)
      `)
      .order("created_at", { ascending: false })
    if (error) {
      console.error("Error loading posts:", error)
      setPosts([])
    } else {
      setPosts((data || []) as BlogPost[])
    }
    setLoading(false)
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return
    const { error } = await supabase.from("blog_posts").delete().eq("id", id)
    if (error) {
      console.error("Error deleting:", error)
      alert("Failed to delete")
    } else {
      loadPosts()
    }
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <div className="flex gap-2">
            <Link href="/blog/authors">
              <Button variant="outline">Authors</Button>
            </Link>
            <Link href="/blog/topics">
              <Button variant="outline">Topics</Button>
            </Link>
            <Link href="/blog/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Post
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <p className="text-sm text-gray-500">Manage blog posts for easner.com</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500 py-8 text-center">Loading...</p>
            ) : posts.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 mb-4">No posts yet.</p>
                <Link href="/blog/new">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" /> Create your first post
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-sm text-gray-500">
                        {post.author?.name} · {post.topic?.name || "No topic"} ·{" "}
                        {post.published_at ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.published_at && (
                        <a
                          href={`https://www.easner.com/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link href={`/blog/edit/${post.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Pencil className="h-4 w-4" /> Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deletePost(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </OfficeDashboardLayout>
  )
}
