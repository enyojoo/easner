"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Unlock, Eye, Settings } from "lucide-react"

interface CardActionsProps {
  cardId: string
  status: string
}

export function CardActions({ cardId, status }: CardActionsProps) {
  const handleFreeze = () => {
    console.log("[v0] Freezing card:", cardId)
    alert("Card frozen successfully")
  }

  const handleUnfreeze = () => {
    console.log("[v0] Unfreezing card:", cardId)
    alert("Card unfrozen successfully")
  }

  const handleViewDetails = () => {
    console.log("[v0] Viewing card details:", cardId)
    alert("Card details would be shown here")
  }

  const handleSettings = () => {
    console.log("[v0] Opening card settings:", cardId)
    alert("Card settings would be shown here")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Actions</CardTitle>
        <CardDescription>Manage your card settings and security</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {status === "active" ? (
          <Button variant="outline" onClick={handleFreeze} className="gap-2 bg-transparent">
            <Lock className="h-4 w-4" />
            Freeze Card
          </Button>
        ) : (
          <Button variant="outline" onClick={handleUnfreeze} className="gap-2 bg-transparent">
            <Unlock className="h-4 w-4" />
            Unfreeze Card
          </Button>
        )}
        <Button variant="outline" onClick={handleViewDetails} className="gap-2 bg-transparent">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
        <Button variant="outline" onClick={handleSettings} className="gap-2 col-span-2 bg-transparent">
          <Settings className="h-4 w-4" />
          Card Settings
        </Button>
      </CardContent>
    </Card>
  )
}
