"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Author {
  id: string
  name: string
  slug: string
}

interface Topic {
  id: string
  name: string
  slug: string
}

export default function NewBlogPostPage() {
  const router = useRouter()
  const [authors, setAuthors] = useState<Author[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [body, setBody] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [authorId, setAuthorId] = useState("")
  const [topicId, setTopicId] = useState("")
  const [publish, setPublish] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newAuthorName, setNewAuthorName] = useState("")
  const [showAddAuthor, setShowAddAuthor] = useState(false)

  useEffect(() => {
    loadAuthors()
    loadTopics()
  }, [])

  useEffect(() => {
    if (title && !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      )
    }
  }, [title])

  async function loadAuthors() {
    const { data } = await supabase.from("blog_authors").select("id, name, slug").order("name")
    setAuthors((data || []) as Author[])
  }

  async function loadTopics() {
    const { data } = await supabase.from("blog_topics").select("id, name, slug").order("sort_order")
    setTopics((data || []) as Topic[])
  }

  async function addAuthor() {
    if (!newAuthorName.trim()) return
    const slug = newAuthorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const { data, error } = await supabase
      .from("blog_authors")
      .insert({ name: newAuthorName.trim(), slug })
      .select("id, name, slug")
      .single()
    if (error) {
      alert("Failed to add author: " + error.message)
      return
    }
    setAuthors((prev) => [...prev, data as Author])
    setAuthorId(data.id)
    setNewAuthorName("")
    setShowAddAuthor(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !slug || !body || !authorId) {
      alert("Please fill in title, slug, body, and author")
      return
    }
    setSaving(true)
    const { error } = await supabase.from("blog_posts").insert({
      title,
      slug,
      excerpt: excerpt || null,
      body,
      cover_image_url: coverImageUrl || null,
      author_id: authorId,
      topic_id: topicId || null,
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    setSaving(false)
    if (error) {
      alert("Failed to save: " + error.message)
      return
    }
    router.push("/blog")
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 lg:p-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>New Post</CardTitle>
            <p className="text-sm text-gray-500">Create a new blog post</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Post title"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="post-slug"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="author">Author *</Label>
                <div className="flex gap-2 mt-1">
                  <select
                    id="author"
                    value={authorId}
                    onChange={(e) => setAuthorId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select author</option>
                    {authors.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <Button type="button" variant="outline" onClick={() => setShowAddAuthor(!showAddAuthor)}>
                    Add new
                  </Button>
                </div>
                {showAddAuthor && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newAuthorName}
                      onChange={(e) => setNewAuthorName(e.target.value)}
                      placeholder="Author name"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAuthor())}
                    />
                    <Button type="button" onClick={addAuthor}>
                      Add
                    </Button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="topic">Topic</Label>
                <select
                  id="topic"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                >
                  <option value="">No topic</option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="cover">Cover Image URL</Label>
                <Input
                  id="cover"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="body">Body (HTML) *</Label>
                <textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="<p>Your content here...</p>"
                  className="flex min-h-[300px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publish"
                  checked={publish}
                  onChange={(e) => setPublish(e.target.checked)}
                />
                <Label htmlFor="publish">Publish immediately</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Post"}
                </Button>
                <Link href="/blog">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </OfficeDashboardLayout>
  )
}
