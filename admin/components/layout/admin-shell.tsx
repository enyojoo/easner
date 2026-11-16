"use client"

import type React from "react"
import { useCallback, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@easner/shared"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JumpTo, JumpToTrigger, useGoToShortcuts, useJumpToHotkey } from "@/components/layout/jump-to"
import { useAuth } from "@/lib/auth-context"
import { ADMIN_HOME, adminNavLinks, isNavItemActive, type NavItem } from "@/lib/nav-config"
import { useMyAuthor, usePostsAttentionCount } from "@/lib/queries-pages"
import { blogFileUrl } from "@/lib/supabase"
import { ROLE_LABEL } from "@/lib/roles"
import { cn } from "@/lib/utils"

/** AppShell from Office (components/layout/office-dashboard-layout.tsx): 256 sidebar, 64 header, no footer. */

const navItemBase =
  "flex w-full min-h-11 items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm transition-[background-color,color,box-shadow,border-color] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]"
const navItemActive =
  "border-border/70 bg-card font-semibold text-foreground shadow-card [&_svg]:text-primary"
const navItemInactive =
  "border-transparent font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground"

/** Amber count: reviews waiting (Editors, Owners) or changes requested on your drafts (Writers). */
function PostsCountPill() {
  const count = usePostsAttentionCount()
  if (count === 0) return null
  return (
    <span
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-warning-surface px-1.5 text-xs font-semibold tabular-nums text-warning-text"
      aria-label={`${count} ${count === 1 ? "post needs" : "posts need"} attention`}
    >
      {count}
    </span>
  )
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(navItemBase, active ? navItemActive : navItemInactive)}
    >
      <Icon aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate">{item.name}</span>
      {item.href === "/posts" ? <PostsCountPill /> : null}
    </Link>
  )
}

function initialsFor(name: string): string {
  const parts = name.split(/[\s@._-]+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0] ?? "").slice(0, 2)
  return letters.toUpperCase() || "U"
}

function AccountMenu() {
  const { user, role, signOut } = useAuth()
  const meta = (user?.user_metadata ?? {}) as { full_name?: string; name?: string }
  const email = user?.email ?? ""
  // The signed-in person is shown as their author profile: its name and photo, then the account's name.
  const author = useMyAuthor().data
  const name = author?.name || meta.full_name || meta.name || email.split("@")[0] || "Account"
  const photo = blogFileUrl(author?.avatar_path)

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch {
      window.location.replace("/auth/login")
    }
  }, [signOut])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="size-9">
            {photo ? <AvatarImage src={photo} alt="" className="object-cover" /> : null}
            <AvatarFallback className="bg-info-surface text-xs font-semibold text-primary-text">
              {initialsFor(name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[264px] p-0">
        <div className="space-y-1 px-4 py-3">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          {email ? <p className="truncate text-[13px] text-muted-foreground">{email}</p> : null}
          {role ? (
            <Badge variant="neutral" className="mt-1">
              {ROLE_LABEL[role]}
            </Badge>
          ) : null}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-1">
          <DropdownMenuItem asChild>
            <Link href="/authors/me">My profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => void handleSignOut()}
            className="text-destructive-text focus:bg-destructive-surface focus:text-destructive-text"
          >
            Sign out
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [jumpOpen, setJumpOpen] = useState(false)

  const openJump = useCallback(() => setJumpOpen(true), [])
  useJumpToHotkey(openJump)
  useGoToShortcuts()

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="fixed left-0 top-0 z-40 flex h-dvh w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 min-h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <Link
            href={ADMIN_HOME}
            className="inline-flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Easner, Posts"
          >
            <BrandLogo size="md" className="h-6 w-auto max-w-[6.5rem]" />
          </Link>
        </div>

        <nav aria-label="Main" className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-6">
          {adminNavLinks.map((item) => (
            <NavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />
          ))}
        </nav>
      </aside>

      <div className="ml-64 flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 min-h-16 shrink-0 items-center gap-4 border-b border-border/60 bg-background/80 px-8 backdrop-blur">
          <JumpToTrigger onClick={openJump} />
          <div className="flex-1" />
          <AccountMenu />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1440px] px-8 pb-10 pt-6">{children}</div>
        </main>
      </div>

      <JumpTo open={jumpOpen} onOpenChange={setJumpOpen} />
    </div>
  )
}
