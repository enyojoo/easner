import type { LucideIcon } from "lucide-react"
import {
  ChartLine,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  LayoutDashboard,
  Settings,
  Signpost,
  UserRoundPen,
} from "lucide-react"

export type NavItem = {
  name: string
  href: string
  icon: LucideIcon
  /** Extra words Jump to matches ("team" finds Settings). */
  keywords?: string[]
}

/** Overview · Analytics · Posts · Media · Categories · Authors · Redirects · Settings (plan §4, Shell / nav). */
export const adminNavLinks: NavItem[] = [
  { name: "Overview", href: "/overview", icon: LayoutDashboard, keywords: ["home", "dashboard"] },
  { name: "Analytics", href: "/analytics", icon: ChartLine, keywords: ["traffic", "views", "website"] },
  { name: "Posts", href: "/posts", icon: FileText, keywords: ["blog", "drafts", "articles"] },
  { name: "Media", href: "/media", icon: ImageIcon, keywords: ["images", "uploads"] },
  { name: "Categories", href: "/categories", icon: FolderOpen },
  { name: "Authors", href: "/authors", icon: UserRoundPen, keywords: ["writers", "profiles"] },
  { name: "Redirects", href: "/redirects", icon: Signpost, keywords: ["301", "slugs"] },
  { name: "Settings", href: "/settings", icon: Settings, keywords: ["team", "members", "invite", "roles"] },
]

export const ADMIN_HOME = "/posts"

export function isNavItemActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}
