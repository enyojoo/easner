"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ArrowLeft, Check, User, CreditCard, Receipt, Loader2 } from "lucide-react"
import { CurrencySelector } from "@/components/ui/currency-selector"
import { formatCurrency } from "@/utils/currency"
import { useAuth } from "@/lib/auth-context"
import { currencyService, recipientService, paymentMethodService, transactionService } from "@/lib/database"

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
}

interface ExchangeRate {
  from_currency: string
  to_currency: string
  rate: number
}

interface Recipient {
  id: string
  full_name: string
  email?: string
  phone?: string
  bank_name?: string
  account_number?: string
  country: string
}

interface PaymentMethod {
  id: string
  type: string
  name: string
  details: any
}

function SendMoneyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()

  // Get URL parameters
  const urlStep = searchParams.get("step")
  const urlSendAmount = searchParams.get("sendAmount")
  const urlSendCurrency = searchParams.get("sendCurrency")
  const urlReceiveCurrency = searchParams.get("receiveCurrency")
  const urlReceiveAmount = searchParams.get("receiveAmount")
  const urlExchangeRate = searchParams.get("exchangeRate")
  const urlFee = searchParams.get("fee")

  const [currentStep, setCurrentStep] = useState(urlStep ? Number.parseInt(urlStep) : 1)
  const [loading, setLoading] = useState(true)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Form data
  const [sendAmount, setSendAmount] = useState(urlSendAmount || "")
  const [sendCurrency, setSendCurrency] = useState(urlSendCurrency || "")
  const [receiveCurrency, setReceiveCurrency] = useState(urlReceiveCurrency || "")
  const [receiveAmount, setReceiveAmount] = useState(Number.parseFloat(urlReceiveAmount || "0"))
  const [exchangeRate, setExchangeRate] = useState(Number.parseFloat(urlExchangeRate || "0"))
  const [fee, setFee] = useState(Number.parseFloat(urlFee || "0"))
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [transactionId, setTransactionId] = useState<string>("")

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)

        // Load currencies, exchange rates, recipients, and payment methods
        const [currenciesData, ratesData, recipientsData, paymentMethodsData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
          recipientService.getByUserId(userProfile?.id || ""),
          paymentMethodService.getByUserId(userProfile?.id || ""),
        ])

        setCurrencies(currenciesData || [])
        setExchangeRates(ratesData || [])
        setRecipients(recipientsData || [])
        setPaymentMethods(paymentMethodsData || [])

        // Set default currencies if not set from URL
        if (!sendCurrency && userProfile?.base_currency) {
          setSendCurrency(userProfile.base_currency)
        }
        if (!receiveCurrency && currenciesData && currenciesData.length > 0) {
          // Set default receive currency to first available currency that's different from send currency
          const defaultReceive = currenciesData.find((c) => c.code !== (sendCurrency || userProfile?.base_currency))
          if (defaultReceive) {
            setReceiveCurrency(defaultReceive.code)
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (userProfile?.id) {
      loadData()
    }
  }, [userProfile, sendCurrency])

  // Calculate exchange when amounts or currencies change
  useEffect(() => {
    if (sendAmount && sendCurrency && receiveCurrency && exchangeRates.length > 0) {
      const rate = exchangeRates.find((r) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency)
      if (rate) {
        const amount = Number.parseFloat(sendAmount)
        const calculatedFee = amount * 0.02 // 2% fee
        const amountAfterFee = amount - calculatedFee
        const converted = amountAfterFee * rate.rate

        setExchangeRate(rate.rate)
        setFee(calculatedFee)
        setReceiveAmount(converted)
      }
    }
  }, [sendAmount, sendCurrency, receiveCurrency, exchangeRates])

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSendMoney = async () => {
    try {
      if (!userProfile?.id || !selectedRecipient || !selectedPaymentMethod) return

      const recipient = recipients.find((r) => r.id === selectedRecipient)
      const paymentMethod = paymentMethods.find((p) => p.id === selectedPaymentMethod)

      if (!recipient || !paymentMethod) return

      // Create transaction
      const transaction = await transactionService.create({
        user_id: userProfile.id,
        recipient_id: selectedRecipient,
        payment_method_id: selectedPaymentMethod,
        send_amount: Number.parseFloat(sendAmount),
        send_currency: sendCurrency,
        receive_amount: receiveAmount,
        receive_currency: receiveCurrency,
        exchange_rate: exchangeRate,
        fee: fee,
        status: "processing",
      })

      if (transaction) {
        setTransactionId(transaction.transaction_id)
        handleNext()
      }
    } catch (error) {
      console.error("Error creating transaction:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-novapay-primary" />
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Amount", description: "Enter amount to send" },
    { number: 2, title: "Recipient", description: "Choose recipient" },
    { number: 3, title: "Payment", description: "Select payment method" },
    { number: 4, title: "Review", description: "Confirm and send" },
  ]

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.number ? "bg-novapay-primary text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={`h-1 rounded-full ${currentStep > step.number ? "bg-novapay-primary" : "bg-gray-200"}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentStep === 1 && <CreditCard className="h-5 w-5" />}
            {currentStep === 2 && <User className="h-5 w-5" />}
            {currentStep === 3 && <CreditCard className="h-5 w-5" />}
            {currentStep === 4 && <Receipt className="h-5 w-5" />}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Amount */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sendAmount">You send</Label>
                  <div className="flex gap-2">
                    <Input
                      id="sendAmount"
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="flex-1"
                    />
                    <CurrencySelector currencies={currencies} value={sendCurrency} onValueChange={setSendCurrency} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiveAmount">Recipient gets</Label>
                  <div className="flex gap-2">
                    <Input
                      id="receiveAmount"
                      type="number"
                      value={receiveAmount.toFixed(2)}
                      readOnly
                      className="flex-1 bg-gray-50"
                    />
                    <CurrencySelector
                      currencies={currencies}
                      value={receiveCurrency}
                      onValueChange={setReceiveCurrency}
                    />
                  </div>
                </div>
              </div>

              {sendAmount && exchangeRate > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exchange rate</span>
                    <span>
                      1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fee</span>
                    <span>{formatCurrency(fee, sendCurrency)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total to pay</span>
                    <span>{formatCurrency(Number.parseFloat(sendAmount), sendCurrency)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Recipient */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select recipient</Label>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a recipient" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{recipient.full_name}</span>
                          <span className="text-sm text-gray-500">
                            {recipient.bank_name} • {recipient.account_number}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {recipients.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No recipients found. Add a recipient first.</p>
                  <Button
                    variant="outline"
                    className="mt-2 bg-transparent"
                    onClick={() => router.push("/user/recipients")}
                  >
                    Add Recipient
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Payment Method */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select payment method</Label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{method.name}</span>
                          <span className="text-sm text-gray-500 capitalize">{method.type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paymentMethods.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No payment methods found. Add a payment method first.</p>
                  <Button
                    variant="outline"
                    className="mt-2 bg-transparent"
                    onClick={() => router.push("/user/profile")}
                  >
                    Add Payment Method
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {transactionId ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Transfer Initiated!</h3>
                  <p className="text-gray-600 mb-4">Your money transfer has been initiated successfully.</p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="font-mono text-lg">{transactionId}</p>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.push("/user/transactions")}>
                      View Transactions
                    </Button>
                    <Button onClick={() => router.push("/user/dashboard")}>Back to Dashboard</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium">Transfer Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>You send</span>
                        <span className="font-medium">
                          {formatCurrency(Number.parseFloat(sendAmount), sendCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee</span>
                        <span>{formatCurrency(fee, sendCurrency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exchange rate</span>
                        <span>
                          1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Recipient gets</span>
                        <span>{formatCurrency(receiveAmount, receiveCurrency)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recipient Details</h4>
                    {selectedRecipient && (
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Name:</strong> {recipients.find((r) => r.id === selectedRecipient)?.full_name}
                        </p>
                        <p>
                          <strong>Bank:</strong> {recipients.find((r) => r.id === selectedRecipient)?.bank_name}
                        </p>
                        <p>
                          <strong>Account:</strong> {recipients.find((r) => r.id === selectedRecipient)?.account_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || !!transactionId}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && (!sendAmount || !sendCurrency || !receiveCurrency)) ||
                  (currentStep === 2 && !selectedRecipient) ||
                  (currentStep === 3 && !selectedPaymentMethod)
                }
                className="flex items-center gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : !transactionId ? (
              <Button
                onClick={handleSendMoney}
                disabled={!selectedRecipient || !selectedPaymentMethod}
                className="flex items-center gap-2"
              >
                Send Money
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SendMoneyPage() {
  return (
    <ProtectedRoute>
      <UserDashboardLayout>
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-novapay-primary" />
            </div>
          }
        >
          <SendMoneyContent />
        </Suspense>
      </UserDashboardLayout>
    </ProtectedRoute>
  )
}
