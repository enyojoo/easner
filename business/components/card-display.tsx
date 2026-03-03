import type { Card as CardType } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard } from "lucide-react"

interface CardDisplayProps {
  card: CardType
}

export function CardDisplay({ card }: CardDisplayProps) {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-700 text-white border-0">
      <CardContent className="p-6 space-y-8">
        <div className="flex items-start justify-between">
          <CreditCard className="h-8 w-8" />
          <Badge variant={card.status === "active" ? "default" : "secondary"} className="bg-white/20 text-white">
            {card.status}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-sm opacity-80">Card Number</p>
          <p className="text-xl font-mono tracking-wider">•••• •••• •••• {card.last4}</p>
        </div>

        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <p className="text-xs opacity-80">Cardholder</p>
            <p className="font-medium">{card.cardholderName}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-xs opacity-80">Expires</p>
            <p className="font-medium">{card.expiryDate}</p>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      </CardContent>
    </Card>
  )
}
