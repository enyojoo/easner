"use client"

import { AuthGuard } from "@/components/auth-guard"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencySelector } from "@/components/ui/currency-selector"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Calculator, Users, Plus } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/utils/currency"
import { useUserData } from "@/hooks/use-user-data"

export default function SendMoneyPage() {
  const router = useRouter()
  const { data } = useUserData()
  const [sendAmount, setSendAmount] = useState("")
  const [sendCurrency, setSendCurrency] = useState("NGN")
  const [receiveCurrency, setReceiveCurrency] = useState("RUB")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [fee, setFee] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)

  const recipients = data?.recipients || []
  const currencies = data?.currencies || []
  const exchangeRates = data?.exchangeRates || []

  useEffect(() => {
    if (sendAmount && sendCurrency && receiveCurrency) {
      calculateExchange()
    }
  }, [sendAmount, sendCurrency, receiveCurrency])

  const calculateExchange = async () => {
    if (!sendAmount || isNaN(Number(sendAmount))) {
      setReceiveAmount("")
      return
    }

    setIsCalculating(true)
    try {
      const rate = exchangeRates.find((r: any) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency)

      if (rate) {
        const amount = Number(sendAmount)
        const calculatedFee = rate.fee_type === "percentage" ? (amount * rate.fee_amount) / 100 : rate.fee_amount

        const amountAfterFee = amount - calculatedFee
        const converted = amountAfterFee * rate.rate

        setExchangeRate(rate.rate)
        setFee(calculatedFee)
        setReceiveAmount(converted.toFixed(2))
      }
    } catch (error) {
      console.error("Exchange calculation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleContinue = () => {
    if (!sendAmount || !selectedRecipient) return

    const transactionData = {
      sendAmount: Number(sendAmount),
      sendCurrency,
      receiveCurrency,
      receiveAmount: Number(receiveAmount),
      recipientId: selectedRecipient,
      exchangeRate,
      fee,
    }

    localStorage.setItem("pendingTransaction", JSON.stringify(transactionData))
    router.push(`/user/send/${selectedRecipient}`)
  }

  return (
    <AuthGuard requireAuth={true}>
      <UserDashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
              <p className="text-gray-600">Transfer money to your recipients worldwide</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/user/recipients">
                <Users className="h-4 w-4 mr-2" />
                Manage Recipients
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Send Money Form */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Details</CardTitle>
                <CardDescription>Enter the amount and select recipient</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Amount Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sendAmount">You Send</Label>
                      <Input
                        id="sendAmount"
                        type="number"
                        placeholder="0.00"
                        value={sendAmount}
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sendCurrency">Currency</Label>
                      <CurrencySelector value={sendCurrency} onValueChange={setSendCurrency} currencies={currencies} />
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-sm">
                        {exchangeRate > 0 && `1 ${sendCurrency} = ${exchangeRate} ${receiveCurrency}`}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="receiveAmount">Recipient Gets</Label>
                      <Input
                        id="receiveAmount"
                        type="text"
                        value={receiveAmount}
                        readOnly
                        className="text-lg font-medium bg-gray-50"
                        placeholder={isCalculating ? "Calculating..." : "0.00"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="receiveCurrency">Currency</Label>
                      <CurrencySelector
                        value={receiveCurrency}
                        onValueChange={setReceiveCurrency}
                        currencies={currencies}
                      />
                    </div>
                  </div>
                </div>

                {/* Fee Breakdown */}
                {fee > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transfer Fee</span>
                      <span className="font-medium">{formatCurrency(fee, sendCurrency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="font-medium">
                        1 {sendCurrency} = {exchangeRate} {receiveCurrency}
                      </span>
                    </div>
                  </div>
                )}

                {/* Recipient Selection */}
                <div className="space-y-2">
                  <Label htmlFor="recipient">Select Recipient</Label>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      {recipients.map((recipient: any) => (
                        <SelectItem key={recipient.id} value={recipient.id}>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{recipient.full_name}</div>
                              <div className="text-sm text-gray-500">{recipient.bank_name}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {recipients.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500 mb-2">No recipients found</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/user/recipients">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Recipient
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!sendAmount || !selectedRecipient || isCalculating}
                  className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                >
                  Continue to Payment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Exchange Rate Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Exchange Rate Calculator
                </CardTitle>
                <CardDescription>Current rates and fees</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {exchangeRates.slice(0, 5).map((rate: any) => (
                    <div
                      key={`${rate.from_currency}-${rate.to_currency}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {rate.from_currency} → {rate.to_currency}
                        </div>
                        <div className="text-sm text-gray-500">
                          Fee:{" "}
                          {rate.fee_type === "percentage"
                            ? `${rate.fee_amount}%`
                            : formatCurrency(rate.fee_amount, rate.from_currency)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{rate.rate}</div>
                        <div className="text-sm text-gray-500">per {rate.from_currency}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </UserDashboardLayout>
    </AuthGuard>
  )
}
