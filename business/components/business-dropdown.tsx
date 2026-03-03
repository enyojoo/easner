"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronUp, ChevronDown, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface BusinessDropdownProps {
  businessName: string
  adminName: string
  adminEmail: string
  onSignOut: () => void
}

export function BusinessDropdown({ businessName, adminName, adminEmail, onSignOut }: BusinessDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
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
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-64 p-2"
        side="top"
        sideOffset={8}
      >
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
