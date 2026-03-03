"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { CreditCard, Home, ArrowLeftRight, History, Search, Landmark, Users, FileText, UserCheck, ChevronDown, ChevronRight, Send, Receipt, Code } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { BusinessDropdown } from "@/components/business-dropdown"
import Image from "next/image"

export function DashboardNav() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  
  // Auto-open groups that contain the current page
  const getInitialOpenGroups = () => {
    const openGroups = new Set<string>()
    
    // Check if current path matches any group items
    if (pathname.startsWith('/send') || pathname.startsWith('/beneficiaries')) {
      openGroups.add('payments')
    }
    if (pathname.startsWith('/invoices') || pathname.startsWith('/customers')) {
      openGroups.add('collections')
    }
    
    return openGroups
  }
  
  const [openGroups, setOpenGroups] = useState<Set<string>>(getInitialOpenGroups())

  // Update open groups when pathname changes
  useEffect(() => {
    setOpenGroups(getInitialOpenGroups())
  }, [pathname])

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey)
      } else {
        newSet.add(groupKey)
      }
      return newSet
    })
  }

  const menuItems = [
    { href: "/dashboard", label: "Home", icon: Home, type: "single" },
    { href: "/accounts", label: "Accounts", icon: Landmark, type: "single" },
    {
      key: "payments",
      label: "Payments",
      icon: Send,
      type: "group",
      items: [
        { href: "/send", label: "Send", icon: ArrowLeftRight },
        { href: "/beneficiaries", label: "Beneficiaries", icon: Users }
      ]
    },
    { href: "/cards", label: "Cards", icon: CreditCard, type: "single" },
    {
      key: "collections",
      label: "Collections", 
      icon: Receipt,
      type: "group",
      items: [
        { href: "/invoices", label: "Invoices", icon: FileText },
        { href: "/customers", label: "Customers", icon: UserCheck }
      ]
    },
    { href: "/transactions", label: "Transactions", icon: History, type: "single" },
    { href: "/developers", label: "Developers", icon: Code, type: "single" }
  ]

  const businessName = "Easner Banking" // This could come from user context or props

  return (
    <div className="fixed left-0 top-0 h-screen w-56 border-r bg-sidebar flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <Image
          src="https://seeqjiebmrnolcyydewj.supabase.co/storage/v1/object/public/brand/Easner%20Logo.svg"
          alt="Easner Banking"
          width={100}
          height={28}
          className="h-7 w-auto"
        />
      </div>

      <nav className="flex-1 px-3 py-4 space-y-2">
        {menuItems.map((item) => {
          if (item.type === "single") {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href || "#"}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-9 px-3 text-sm font-normal",
                    isActive && "bg-accent text-accent-foreground font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          } else {
            const isOpen = openGroups.has(item.key || "")
            const hasActiveChild = item.items?.some(child => pathname === child.href) || false
            
            return (
              <div key={item.key} className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => toggleGroup(item.key || "")}
                  className={cn(
                    "w-full justify-between gap-3 h-9 px-3 text-sm font-normal",
                    hasActiveChild && "bg-accent text-accent-foreground font-medium",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {isOpen && (
                  <div className="ml-4 space-y-1.5">
                    {item.items?.map((child) => {
                      const ChildIcon = child.icon
                      const isActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 h-8 px-3 text-sm font-normal",
                              isActive && "bg-accent text-accent-foreground font-medium",
                            )}
                          >
                            <ChildIcon className="h-4 w-4" />
                            {child.label}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }
        })}
      </nav>

      <div className="border-t p-3">
        <BusinessDropdown
          businessName={businessName}
          adminName={user?.name || "Admin"}
          adminEmail={user?.email || ""}
          onSignOut={logout}
        />
      </div>
    </div>
  )
}

export function DashboardTopBar() {
  return (
    <div className="border-b bg-background h-14 flex items-center px-6 gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search or jump to..." className="pl-9 h-9 bg-muted/50 border-0" />
      </div>
      <Button size="sm" className="ml-auto">
        Move Money
      </Button>
    </div>
  )
}
