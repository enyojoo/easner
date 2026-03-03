"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, Terminal, Key, ExternalLink, FileText, History } from "lucide-react"
import Link from "next/link"

const developerTools = [
  {
    title: "API Reference",
    description: "Complete API documentation with examples and code snippets",
    icon: Code,
    href: "/developers/api-reference",
    external: true
  },
  {
    title: "SDKs",
    description: "Official SDKs for popular programming languages",
    icon: Terminal,
    href: "/developers/sdks",
    external: true
  },
  {
    title: "Webhooks",
    description: "Set up webhooks to receive real-time notifications",
    icon: Code,
    href: "/developers/webhooks"
  },
  {
    title: "Events",
    description: "Monitor and track API events and activities",
    icon: History,
    href: "/developers/events"
  },
  {
    title: "Logs",
    description: "View detailed logs and debugging information",
    icon: FileText,
    href: "/developers/logs"
  },
  {
    title: "API Keys",
    description: "Manage your API keys and authentication",
    icon: Key,
    href: "/developers/api-keys"
  }
]

export default function DevelopersOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Developer Tools</h1>
        <p className="text-muted-foreground mt-2">Build and integrate with Easner Banking's APIs and services</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Key className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active API Keys</p>
                <p className="text-2xl font-semibold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Code className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Webhooks</p>
                <p className="text-2xl font-semibold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {developerTools.map((tool) => {
          const IconComponent = tool.icon
          return (
            <Link key={tool.title} href={tool.href}>
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
                          {tool.title}
                        </h3>
                        {tool.external && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        {tool.description}
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
  )
}
