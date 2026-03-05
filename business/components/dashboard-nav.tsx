"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { CreditCard, Home, ArrowLeftRight, History, Landmark, Users, FileText, UserCheck, ChevronDown, ChevronRight, Send, Receipt, Link2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BusinessDropdown } from "@/components/business-dropdown"
import { BrandLogo } from "@/components/brand/brand-logo"

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
    if (pathname.startsWith('/invoices') || pathname.startsWith('/payment-links') || pathname.startsWith('/customers')) {
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
        { href: "/payment-links", label: "Payment links", icon: Link2 },
        { href: "/customers", label: "Customers", icon: UserCheck }
      ]
    },
    { href: "/transactions", label: "Transactions", icon: History, type: "single" }
  ]

  const businessName = "Easner Banking" // This could come from user context or props

  return (
    <div className="fixed left-0 top-0 h-screen w-56 border-r bg-sidebar flex flex-col">
      <div className="flex items-center justify-between px-6 h-16 border-b border-sidebar-border">
        <BrandLogo size="sm" className="h-7" />
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => {
          if (item.type === "single") {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href || "#"}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 px-3 py-3 h-auto text-sm font-medium rounded-md transition-all duration-200",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              </Link>
            )
          } else {
            const isOpen = openGroups.has(item.key || "")
            const hasActiveChild = item.items?.some(child => pathname === child.href) || false
            
            return (
              <div key={item.key} className="space-y-1">
                <Button
                  variant="ghost"
                  onClick={() => toggleGroup(item.key || "")}
                  className={cn(
                    "w-full justify-between gap-3 px-3 py-3 h-auto text-sm font-medium rounded-md transition-all duration-200",
                    hasActiveChild
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </Button>
                
                {isOpen && (
                  <div className="ml-4 space-y-1">
                    {item.items?.map((child) => {
                      const ChildIcon = child.icon
                      const isActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start gap-3 px-3 py-3 h-auto text-sm font-medium rounded-md transition-all duration-200",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            )}
                          >
                            <ChildIcon className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate">{child.label}</span>
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

      <div className="px-3 py-4 border-t border-sidebar-border">
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
