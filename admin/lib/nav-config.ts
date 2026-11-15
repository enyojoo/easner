import type { LucideIcon } from "lucide-react"
import { ChartLine, FileText, LayoutDashboard, Settings, UserRoundPen } from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  /** Extra words Jump to matches ("team" finds Settings). */
  keywords?: string[]
}

/** Overview · Analytics · Posts · Authors · Settings. Team, Redirects, Media and Categories are tabs inside Settings. */
export const adminNavLinks: NavItem[] = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard, keywords: ["home", "dashboard"] },
  { name: "Analytics", href: "/analytics", icon: ChartLine, keywords: ["traffic", "views", "website"] },
  { name: "Posts", href: "/posts", icon: FileText, keywords: ["blog", "drafts", "articles"] },
  { name: "Authors", href: "/authors", icon: UserRoundPen, keywords: ["writers", "profiles"] },
  { name: "Settings", href: "/settings", icon: Settings, keywords: ["team", "members", "invite", "roles"] },
]

export type SettingsTab = "team" | "redirects" | "media" | "categories"

/** The tabs of Settings, each its own route. Jump to lists them too. */
export const settingsTabs: Array<{ value: SettingsTab; label: string; href: string; keywords: string[] }> = [
  { value: "team", label: "Team", href: "/settings", keywords: ["members", "invite", "roles"] },
  { value: "redirects", label: "Redirects", href: "/settings/redirects", keywords: ["301", "slugs"] },
  { value: "media", label: "Media", href: "/settings/media", keywords: ["images", "uploads"] },
  { value: "categories", label: "Categories", href: "/settings/categories", keywords: ["topics"] },
]

export const ADMIN_HOME = "/posts"

export function isNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
