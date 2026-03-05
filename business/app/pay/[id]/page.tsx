"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockPaymentLinks, currencySymbols } from "@/lib/mock-data"
import { Building2, Coins, Link2 } from "lucide-react"

export default function PayPage() {
  const params = useParams()
  const link = mockPaymentLinks.find((l) => l.id === params.id)

  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Link2 className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold">Payment link not found</h1>
              <p className="text-sm text-muted-foreground">
                This payment link may have expired or the URL is incorrect.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (link.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h1 className="text-xl font-semibold">This link is no longer active</h1>
              <p className="text-sm text-muted-foreground">
                {link.status === "paid"
                  ? "This payment has already been completed."
                  : "This payment link has expired."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-xl">Pay with Easner</CardTitle>
          <p className="text-sm text-muted-foreground">{link.description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-4">
            <p className="text-3xl font-bold">
              {currencySymbols[link.currency]}
              {link.amount.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{link.currency}</p>
          </div>

          <div className="space-y-3">
            <Button className="w-full gap-2" size="lg">
              <Building2 className="h-4 w-4" />
              Pay with bank transfer
            </Button>
            <Button variant="outline" className="w-full gap-2" size="lg">
              <Coins className="h-4 w-4" />
              Pay with stablecoin
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You will be redirected to complete your payment securely.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
