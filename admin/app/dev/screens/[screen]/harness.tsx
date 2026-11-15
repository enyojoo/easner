"use client"

import { Suspense, useState, type ComponentType } from "react"
import { useSearchParams } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AdminShell } from "@/components/layout/admin-shell"
import { AuthContext, type AuthContextType } from "@/lib/auth-context"
import { adminKeys, type CategoryRow, type InviteRow, type MemberRow, type PostRow } from "@/lib/queries"
import { pageKeys, type AuthorRow, type MediaRow, type MediaUsageRow, type MemberLite, type PostFlagRow } from "@/lib/queries-pages"
import type { AdminRole } from "@/lib/roles"
import { AnalyticsSourceProvider } from "@/lib/analytics/hooks"
import { isoDay } from "@/lib/analytics/paths"
import { SAMPLE_POSTS, createSampleSource } from "@/lib/analytics/sample"
import PostsPage from "@/app/posts/page"
import AuthorsPage from "@/app/authors/page"
import MyProfilePage from "@/app/authors/me/page"
import { MediaTab as MediaPage } from "@/components/settings/media-tab"
import { CategoriesTab as CategoriesPage } from "@/components/settings/categories-tab"
import SettingsPage from "@/app/settings/page"

/**
 * Development harness for the screens that need signed-in data: the real page components, the real shell, and a
 * query cache seeded with deterministic rows. No Supabase, no sign-in. Reads work; saving is not wired (a save
 * shows its error toast), which is fine for checking layout against the cards.
 * `?role=writer|editor|owner` (default owner), `?empty=1` empties the lists. Enabled only with NODE_ENV=development
 * and ADMIN_DEV_HARNESS=1 (app/dev/layout.tsx answers 404 otherwise).
 */

const SCREENS: Record<string, ComponentType> = {
  posts: PostsPage,
  authors: AuthorsPage,
  "my-profile": MyProfilePage,
  media: MediaPage,
  categories: CategoriesPage,
  settings: SettingsPage,
}

const ago = (days: number, hours = 0) => new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString()
const ME = "me"

const CATEGORIES: CategoryRow[] = [
  { id: "c1", slug: "sending-money", name: "Sending money", description: "Transfers, rates, fees and arrival times.", sort_order: 1, seo_title: null, seo_description: "How to send money abroad.", archived_at: null, updated_at: ago(12) },
  { id: "c2", slug: "business", name: "Business", description: "Payroll, invoicing and collecting from clients.", sort_order: 2, seo_title: null, seo_description: null, archived_at: null, updated_at: ago(30) },
  { id: "c3", slug: "freelancers", name: "Freelancers", description: "Getting paid by clients in other countries.", sort_order: 3, seo_title: null, seo_description: null, archived_at: null, updated_at: ago(41) },
  { id: "c4", slug: "money-basics", name: "Money basics", description: "Plain explainers.", sort_order: 4, seo_title: null, seo_description: null, archived_at: null, updated_at: ago(60) },
  { id: "c5", slug: "company-news", name: "Company news", description: "Product and company updates.", sort_order: 5, seo_title: null, seo_description: null, archived_at: ago(20), updated_at: ago(20) },
]

const AUTHORS: AuthorRow[] = [
  { id: "a1", slug: "ada-okafor", name: "Ada Okafor", title: "Head of Product", location: "Lagos", avatar_path: "/dev/sample-image", bio: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Writes about moving money across borders and the products that make it simple." }] }] }, x_url: "https://x.com/ada", linkedin_url: null, github_url: null, website_url: null, member_id: ME, post_count: 8, member_role: "owner" },
  { id: "a2", slug: "wanjiru-kamau", name: "Wanjiru Kamau", title: "Editor", location: "Nairobi", avatar_path: null, bio: null, x_url: null, linkedin_url: null, github_url: null, website_url: null, member_id: "u2", post_count: 5, member_role: "editor" },
  { id: "a3", slug: "daniel-mensah", name: "Daniel Mensah", title: null, location: null, avatar_path: null, bio: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Payments engineer." }] }] }, x_url: null, linkedin_url: null, github_url: "https://github.com/dmensah", website_url: null, member_id: "u3", post_count: 2, member_role: "writer" },
  { id: "a4", slug: "product-team", name: "Product team", title: null, location: null, avatar_path: null, bio: null, x_url: null, linkedin_url: null, github_url: null, website_url: null, member_id: null, post_count: 3, member_role: null },
]

const MEMBERS: MemberRow[] = [
  { user_id: ME, role: "owner", name: "Ada Okafor", email: "ada@easner.com", created_at: ago(90) },
  { user_id: "u2", role: "editor", name: "Wanjiru Kamau", email: "wanjiru@easner.com", created_at: ago(60) },
  { user_id: "u3", role: "writer", name: "Daniel Mensah", email: "daniel@easner.com", created_at: ago(14) },
]
const INVITES: InviteRow[] = [{ id: "i1", email: "tomas@example.com", role: "writer", name: "Tomás Rivera", created_at: ago(2) }]

function post(id: string, title: string, status: PostRow["status"], cat: string | null, authors: string[], over: Partial<PostRow> = {}): PostRow {
  return {
    id, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), title, status, cover_path: status === "draft" ? null : "/dev/sample-image", cover_alt: null,
    category_id: cat, created_by: "u3", updated_at: ago(1), published_at: null, scheduled_for: null, has_unpublished_changes: false,
    authors: authors.map((name, i) => ({ id: `a${i + 1}`, name })), ...over,
  }
}
const POSTS: PostRow[] = [
  post("p1", "Sending money to Kenya: M-Pesa, bank or card?", "in_review", "c1", ["Daniel Mensah"], { updated_at: ago(0, 3) }),
  post("p2", "What stablecoin settlement means for your invoices", "in_review", "c2", ["Wanjiru Kamau"], { updated_at: ago(0, 9) }),
  post("p3", "Checkout for your own website, explained", "changes_requested", "c2", ["Daniel Mensah"], { created_by: ME, updated_at: ago(1) }),
  post("p4", "Our seed round, and what comes next", "scheduled", null, ["Ada Okafor"], { scheduled_for: new Date(Date.now() + 30 * 3_600_000).toISOString(), updated_at: ago(2) }),
  post("p5", "Holding USD and EUR: a guide for freelancers", "draft", "c3", ["Ada Okafor"], { updated_at: ago(3), created_by: ME }),
  post(SAMPLE_POSTS[0].id, "How payroll works across five countries", "published", "c2", ["Ada Okafor", "Wanjiru Kamau"], { published_at: ago(6), updated_at: ago(2), has_unpublished_changes: true }),
  post(SAMPLE_POSTS[1].id, "Sending money to Nigeria", "published", "c1", ["Ada Okafor"], { published_at: ago(14), updated_at: ago(14) }),
  post(SAMPLE_POSTS[2].id, "Invoicing clients in Mexico", "published", "c3", ["Daniel Mensah"], { published_at: ago(22), updated_at: ago(20) }),
  post(SAMPLE_POSTS[3].id, "What a mid-market rate is", "published", "c4", ["Product team"], { published_at: ago(35), updated_at: ago(35) }),
  post(SAMPLE_POSTS[4].id, "Getting paid in USD from the UK", "published", "c3", ["Wanjiru Kamau"], { published_at: ago(48), updated_at: ago(40) }),
  post("p11", "Our 2025 roadmap", "archived", "c5", ["Ada Okafor"], { published_at: ago(300), updated_at: ago(120) }),
]

const MEDIA: MediaRow[] = [
  ["m1", 1600, 900, "image/jpeg", 482_000, "Dashboard on a laptop"], ["m2", 1600, 900, "image/jpeg", 391_000, null], ["m3", 1200, 800, "image/png", 912_000, "Phone showing a transfer"],
  ["m4", 2400, 1350, "image/jpeg", 1_820_000, "Team at a desk"], ["m5", 800, 800, "image/png", 120_000, null], ["m6", 1600, 900, "image/webp", 210_000, "Map of Africa"],
  ["m7", 1920, 1080, "image/jpeg", 640_000, "Invoice on screen"], ["m8", 1000, 1500, "image/jpeg", 330_000, null], ["m9", 1600, 900, "image/jpeg", 450_000, "Hands holding a card"],
  ["m10", 1600, 900, "image/jpeg", 305_000, null], ["m11", 1280, 720, "image/png", 260_000, "Chart"], ["m12", 1600, 900, "image/jpeg", 515_000, "Skyline"],
].map(([id, width, height, mime, size, alt], i) => ({ id: id as string, path: "/dev/sample-image", width: width as number, height: height as number, mime: mime as string, size: size as number, alt: alt as string | null, caption: null, created_at: ago(i * 3) }))
const USAGE: MediaUsageRow[] = [
  { media_id: "m1", post_id: SAMPLE_POSTS[0].id, in_cover: true, in_content: false }, { media_id: "m2", post_id: SAMPLE_POSTS[1].id, in_cover: true, in_content: true }, { media_id: "m3", post_id: "p1", in_cover: false, in_content: true },
  { media_id: "m4", post_id: "p4", in_cover: true, in_content: false }, { media_id: "m6", post_id: SAMPLE_POSTS[2].id, in_cover: true, in_content: false },
]

function seed(empty: boolean): QueryClient {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, gcTime: Infinity, retry: false, refetchOnMount: false, refetchOnWindowFocus: false, refetchOnReconnect: false } } })
  const set = (key: readonly unknown[], data: unknown) => client.setQueryData(key, data)
  const posts = empty ? [] : POSTS
  set(adminKeys.posts(), posts)
  set(adminKeys.categories(), empty ? [] : CATEGORIES)
  set(adminKeys.team(), { members: MEMBERS, invites: empty ? [] : INVITES })
  set(pageKeys.authors(), empty ? [] : AUTHORS)
  set(pageKeys.myAuthor(), { ...AUTHORS[0] })
  set(pageKeys.members(), MEMBERS.map(({ user_id, name, email, role }): MemberLite => ({ user_id, name, email, role })))
  set(pageKeys.media(), empty ? [] : MEDIA)
  set(pageKeys.mediaUsage(), empty ? [] : USAGE)
  set(pageKeys.postFlags(), posts.map((p): PostFlagRow => ({ id: p.id, title: p.title, slug: p.slug, status: p.status, created_by: p.created_by, updated_at: p.updated_at, published_at: p.published_at, scheduled_for: p.scheduled_for, claims_flagged: false, has_unpublished_changes: p.has_unpublished_changes })))
  return client
}

function authValue(role: AdminRole): AuthContextType {
  return {
    user: { id: ME, email: "ada@easner.com", user_metadata: { name: "Ada Okafor" } } as unknown as AuthContextType["user"],
    role, access: "ready", hasVerifiedFactor: true, sessionResolved: true, sessionUserId: ME, adminQueriesEnabled: true,
    refresh: async () => "ready", signOut: async () => {},
  }
}

function Inner({ screen }: { screen: string }) {
  const params = useSearchParams()
  const role = (["owner", "editor", "writer"].includes(params.get("role") ?? "") ? params.get("role") : "owner") as AdminRole
  const [client] = useState(() => seed(params.get("empty") === "1"))
  const [source] = useState(() => createSampleSource(isoDay(new Date())))
  const Screen = SCREENS[screen]
  if (!Screen) return <p className="p-8 text-sm text-muted-foreground">Unknown screen. Try {Object.keys(SCREENS).join(", ")}.</p>
  return (
    <QueryClientProvider client={client}>
      <AuthContext.Provider value={authValue(role)}>
        <AnalyticsSourceProvider id="sample" source={source}>
          <AdminShell>
            <Suspense fallback={null}>
              <Screen />
            </Suspense>
          </AdminShell>
        </AnalyticsSourceProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  )
}

export function ScreensHarness({ screen }: { screen: string }) {
  return (
    <Suspense fallback={null}>
      <Inner screen={screen} />
    </Suspense>
  )
}
