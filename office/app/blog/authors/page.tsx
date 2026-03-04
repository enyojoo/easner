"use client"

import { useState, useEffect } from "react"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

interface Author {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  bio: string | null
}

export default function BlogAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newBio, setNewBio] = useState("")

  useEffect(() => {
    loadAuthors()
  }, [])

  async function loadAuthors() {
    const { data } = await supabase.from("blog_authors").select("*").order("name")
    setAuthors((data || []) as Author[])
    setLoading(false)
  }

  async function addAuthor(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const slug = newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const { error } = await supabase.from("blog_authors").insert({ name: newName.trim(), slug, bio: newBio || null })
    if (error) {
      alert("Failed: " + error.message)
      return
    }
    setNewName("")
    setNewSlug("")
    setNewBio("")
    setShowAdd(false)
    loadAuthors()
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 lg:p-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Authors</CardTitle>
                <p className="text-sm text-gray-500">Manage blog authors</p>
              </div>
              <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
                <Plus className="h-4 w-4" /> Add author
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAdd && (
              <form onSubmit={addAuthor} className="mb-6 p-4 border rounded-lg space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Author name" required />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="author-slug" />
                </div>
                <div>
                  <Label>Bio</Label>
                  <Input value={newBio} onChange={(e) => setNewBio(e.target.value)} placeholder="Short bio" />
                </div>
                <Button type="submit">Add</Button>
              </form>
            )}
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : authors.length === 0 ? (
              <p className="text-gray-500">No authors yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {authors.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-sm text-gray-500">{a.slug}</span>
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
