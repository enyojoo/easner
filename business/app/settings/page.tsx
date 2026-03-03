"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Globe, 
  Clock, 
  Star,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

const settingsSections = [
  {
    title: "Personal settings",
    items: [
      {
        id: "profile",
        title: "Personal details",
        description: "Contact information, password, authentication methods, and your active sessions.",
        icon: User,
        href: "/settings/profile"
      },
      {
        id: "communication",
        title: "Communication preferences",
        description: "Customize the emails, SMS, and push notifications you receive.",
        icon: Mail,
        href: "/settings/communication"
      },
    ]
  },
  {
    title: "Account settings",
    items: [
      {
        id: "business",
        title: "Business",
        description: "Account details, account health, public info, payouts, legal entity, custom domains, and more.",
        icon: Building2,
        href: "/settings/business"
      },
      {
        id: "team",
        title: "Team and security",
        description: "Team members, roles, account security, authorized apps, and shared resources.",
        icon: Shield,
        href: "/settings/team"
      },
      {
        id: "profile",
        title: "Easner profile",
        description: "Manage how you show up on the Easner business network.",
        icon: Globe,
        href: "/settings/network"
      },
      {
        id: "plans",
        title: "Your plans",
        description: "Manage how you pay for Easner services.",
        icon: Clock,
        href: "/settings/plans"
      },
      {
        id: "perks",
        title: "Perks",
        description: "Discounts on tools to run your startup.",
        icon: Star,
        href: "/settings/perks"
      }
    ]
  }
]

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => (
        <div key={section.title} className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.items.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.id} href={item.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-muted-foreground" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
