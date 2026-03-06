"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronUp, ChevronDown, Settings, LogOut, HelpCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BusinessDropdownProps {
  businessName: string
  adminName: string
  adminEmail: string
  onSignOut: () => void
  /** Compact trigger for header (avatar + name) */
  variant?: "sidebar" | "header"
}

export function BusinessDropdown({ businessName, adminName, adminEmail, onSignOut, variant = "sidebar" }: BusinessDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        {variant === "header" ? (
          <Button
            variant="ghost"
            className="gap-2 px-2 py-1.5 h-auto hover:bg-muted/50"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {adminName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-between p-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {businessName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{businessName}</p>
              </div>
              <div className="flex items-center">
                {isOpen ? (
                  <ChevronUp className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
            </div>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={variant === "header" ? "end" : "start"}
        className={cn(
          "p-2",
          variant === "header" ? "w-56 min-w-[14rem]" : "w-64"
        )}
        side={variant === "header" ? "bottom" : "top"}
        sideOffset={8}
      >
        {variant === "header" && (
          <>
            <div className="px-2 py-2">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-muted-foreground truncate">{adminEmail}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        {variant === "sidebar" && (
          <>
            <div className="px-3 py-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {businessName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{businessName}</p>
                  <p className="text-xs text-muted-foreground">Business account</p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{adminName}</p>
              <p className="text-xs text-muted-foreground">{adminEmail}</p>
              <p className="text-xs text-muted-foreground">Account admin</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <a href="mailto:support@easner.com" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span>Contact</span>
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="gap-2">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            <span>Account settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600" onClick={onSignOut}>
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
