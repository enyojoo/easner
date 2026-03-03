"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { currencySymbols } from "@/lib/mock-data"
import { Suspense } from "react"

function TransferStatusContent() {
  const searchParams = useSearchParams()
  const transferId = searchParams.get("id")
  const amount = searchParams.get("amount")
  const currency = searchParams.get("currency") as keyof typeof currencySymbols
  const recipient = searchParams.get("recipient")

  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transfer Status</h1>
        <p className="text-sm text-muted-foreground mt-1">Your transfer has been initiated</p>
      </div>

      <Card className="border-0 shadow-sm bg-primary/5">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-4">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Transfer Initiated</h2>
          <p className="text-sm text-muted-foreground mb-6">Your transfer is being processed</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Clock className="h-4 w-4" />
            Processing
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Transfer ID</span>
            <span className="font-mono font-medium">{transferId}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="text-xl font-semibold">
              {currencySymbols[currency]}
              {Number.parseFloat(amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-sm text-muted-foreground">Recipient</span>
            <span className="font-medium">{formatName(recipient || "")}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <span className="text-sm font-medium text-primary">Processing</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button asChild variant="outline" size="lg" className="flex-1 h-11 bg-transparent">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Button asChild size="lg" className="flex-1 h-11">
          <Link href="/transactions">View All Transactions</Link>
        </Button>
      </div>
    </div>
  )
}

export default function TransferStatusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransferStatusContent />
    </Suspense>
  )
}
