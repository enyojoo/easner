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

interface Topic {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
}

export default function BlogTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSlug, setNewSlug] = useState("")
  const [newDesc, setNewDesc] = useState("")

  useEffect(() => {
    loadTopics()
  }, [])

  async function loadTopics() {
    const { data } = await supabase.from("blog_topics").select("*").order("sort_order")
    setTopics((data || []) as Topic[])
    setLoading(false)
  }

  async function addTopic(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const slug = newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    const { error } = await supabase.from("blog_topics").insert({
      name: newName.trim(),
      slug,
      description: newDesc || null,
      sort_order: topics.length,
    })
    if (error) {
      alert("Failed: " + error.message)
      return
    }
    setNewName("")
    setNewSlug("")
    setNewDesc("")
    setShowAdd(false)
    loadTopics()
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
                <CardTitle>Topics</CardTitle>
                <p className="text-sm text-gray-500">Manage blog topics</p>
              </div>
              <Button onClick={() => setShowAdd(!showAdd)} className="gap-2">
                <Plus className="h-4 w-4" /> Add topic
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAdd && (
              <form onSubmit={addTopic} className="mb-6 p-4 border rounded-lg space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Topic name" required />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="topic-slug" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Short description" />
                </div>
                <Button type="submit">Add</Button>
              </form>
            )}
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : topics.length === 0 ? (
              <p className="text-gray-500">No topics yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {topics.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{t.name}</span>
                    <span className="text-sm text-gray-500">{t.slug}</span>
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
