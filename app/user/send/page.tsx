"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Check, CreditCard, User, Building } from "lucide-react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { CurrencyConverter } from "@/components/currency-converter"
import { currencyService, recipientService, paymentMethodService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import type { Currency, ExchangeRate, Recipient, PaymentMethod } from "@/types"

export default function SendMoneyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  // Step management
  const [currentStep, setCurrentStep] = useState(1)

  // Form data
  const [sendAmount, setSendAmount] = useState("")
  const [sendCurrency, setSendCurrency] = useState("")
  const [receiveCurrency, setReceiveCurrency] = useState("")
  const [receiveAmount, setReceiveAmount] = useState(0)
  const [exchangeRate, setExchangeRate] = useState(0)
  const [fee, setFee] = useState(0)
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null)
  const [purpose, setPurpose] = useState("")

  // Data from database
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Check for URL parameters and apply them immediately
  useEffect(() => {
    const step = searchParams.get("step")
    const urlSendAmount = searchParams.get("sendAmount")
    const urlSendCurrency = searchParams.get("sendCurrency")
    const urlReceiveCurrency = searchParams.get("receiveCurrency")
    const urlReceiveAmount = searchParams.get("receiveAmount")
    const urlExchangeRate = searchParams.get("exchangeRate")
    const urlFee = searchParams.get("fee")

    console.log("URL Parameters:", {
      step,
      urlSendAmount,
      urlSendCurrency,
      urlReceiveCurrency,
      urlReceiveAmount,
      urlExchangeRate,
      urlFee,
    })

    if (step) {
      setCurrentStep(Number.parseInt(step))
    }

    if (urlSendAmount) setSendAmount(urlSendAmount)
    if (urlSendCurrency) setSendCurrency(urlSendCurrency)
    if (urlReceiveCurrency) setReceiveCurrency(urlReceiveCurrency)
    if (urlReceiveAmount) setReceiveAmount(Number.parseFloat(urlReceiveAmount))
    if (urlExchangeRate) setExchangeRate(Number.parseFloat(urlExchangeRate))
    if (urlFee) setFee(Number.parseFloat(urlFee))

    // Clear URL parameters after loading
    if (step || urlSendAmount || urlSendCurrency) {
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [searchParams])

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const [currenciesData, ratesData, recipientsData, paymentMethodsData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
          recipientService.getByUserId(user.id),
          paymentMethodService.getByUserId(user.id),
        ])

        setCurrencies(currenciesData || [])
        setExchangeRates(ratesData || [])
        setRecipients(recipientsData || [])
        setPaymentMethods(paymentMethodsData || [])

        // Only set default currencies if they haven't been set from URL params
        if (!sendCurrency && !receiveCurrency && currenciesData && currenciesData.length > 0) {
          console.log("Setting default currencies")
          setSendCurrency(currenciesData[0]?.code || "RUB")
          setReceiveCurrency(currenciesData[1]?.code || "NGN")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        // Fallback data
        setCurrencies([
          {
            id: "1",
            code: "RUB",
            name: "Russian Ruble",
            symbol: "₽",
            flag: "/flags/russia.svg",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "2",
            code: "NGN",
            name: "Nigerian Naira",
            symbol: "₦",
            flag: "/flags/nigeria.svg",
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        setExchangeRates([
          {
            id: "1",
            from_currency: "RUB",
            to_currency: "NGN",
            rate: 22.45,
            fee_type: "free",
            fee_amount: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user?.id, sendCurrency, receiveCurrency]) // Remove sendCurrency and receiveCurrency from dependencies

  const handleCurrencyConverterData = (data: {
    sendAmount: string
    sendCurrency: string
    receiveCurrency: string
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => {
    setSendAmount(data.sendAmount)
    setSendCurrency(data.sendCurrency)
    setReceiveCurrency(data.receiveCurrency)
    setReceiveAmount(data.receiveAmount)
    setExchangeRate(data.exchangeRate)
    setFee(data.fee)
    setCurrentStep(2)
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Handle transaction submission
    console.log("Submitting transaction:", {
      sendAmount,
      sendCurrency,
      receiveCurrency,
      receiveAmount,
      exchangeRate,
      fee,
      selectedRecipient,
      selectedPaymentMethod,
      purpose,
    })

    // Navigate to step 4 (confirmation)
    setCurrentStep(4)
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const FlagIcon = ({ currency }: { currency: Currency }) => {
    if (!currency.flag) return null

    if (currency.flag.startsWith("<svg")) {
      return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
    }

    if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
      return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={20} height={20} />
    }

    return <span className="text-xs">{currency.code}</span>
  }

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
            <p className="text-gray-600">Transfer money to your recipients</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-novapay-primary text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-full h-1 mx-4 ${step < currentStep ? "bg-novapay-primary" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Enter Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrencyConverter onSendMoney={handleCurrencyConverterData} />
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Recipient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">You send</span>
                  <span className="font-semibold">{formatCurrency(Number.parseFloat(sendAmount), sendCurrency)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Fee</span>
                  <span className="font-semibold text-green-600">
                    {fee === 0 ? "FREE" : formatCurrency(fee, sendCurrency)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Recipient gets</span>
                  <span className="font-semibold text-novapay-primary">
                    {formatCurrency(receiveAmount, receiveCurrency)}
                  </span>
                </div>
              </div>

              {/* Recipients List */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Recipient</h3>
                  <Button variant="outline" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Add New
                  </Button>
                </div>

                {recipients.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recipients found</p>
                    <Button>Add Your First Recipient</Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRecipient?.id === recipient.id
                            ? "border-novapay-primary bg-novapay-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedRecipient(recipient)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {recipient.first_name} {recipient.last_name}
                            </h4>
                            <p className="text-sm text-gray-600">{recipient.email}</p>
                            <p className="text-sm text-gray-600">{recipient.phone}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{recipient.country}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNextStep} disabled={!selectedRecipient}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Sending to</span>
                  <span className="font-semibold">
                    {selectedRecipient?.first_name} {selectedRecipient?.last_name}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-semibold">{formatCurrency(receiveAmount, receiveCurrency)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total cost</span>
                  <span className="font-semibold">
                    {formatCurrency(Number.parseFloat(sendAmount) + fee, sendCurrency)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Payment Method</h3>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No payment methods found</p>
                    <Button>Add Payment Method</Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPaymentMethod?.id === method.id
                            ? "border-novapay-primary bg-novapay-primary-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPaymentMethod(method)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              {method.type === "card" && <CreditCard className="w-5 h-5" />}
                              {method.type === "bank" && <Building className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-medium">{method.name}</h4>
                              <p className="text-sm text-gray-600">
                                {method.type === "card"
                                  ? `•••• ${method.details.last4}`
                                  : method.details.account_number}
                              </p>
                            </div>
                          </div>
                          <Badge variant={method.is_default ? "default" : "secondary"}>
                            {method.is_default ? "Default" : method.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Purpose */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Transfer</Label>
                <Textarea
                  id="purpose"
                  placeholder="Enter the purpose of this transfer..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={!selectedPaymentMethod}>
                  Review & Send
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Check className="w-6 h-6 mr-2" />
                Transfer Successful
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Money Sent Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Your transfer of {formatCurrency(receiveAmount, receiveCurrency)} to {selectedRecipient?.first_name}{" "}
                  {selectedRecipient?.last_name} has been processed.
                </p>

                {/* Transaction Details */}
                <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto">
                  <h4 className="font-medium mb-4">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-medium">#TXN{Date.now().toString().slice(-6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Sent</span>
                      <span className="font-medium">{formatCurrency(Number.parseFloat(sendAmount), sendCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee</span>
                      <span className="font-medium text-green-600">
                        {fee === 0 ? "FREE" : formatCurrency(fee, sendCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Received</span>
                      <span className="font-medium">{formatCurrency(receiveAmount, receiveCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange Rate</span>
                      <span className="font-medium">
                        1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => router.push("/user/transactions")}>
                  View Transactions
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(1)
                    setSendAmount("")
                    setSelectedRecipient(null)
                    setSelectedPaymentMethod(null)
                    setPurpose("")
                  }}
                >
                  Send Another
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardLayout>
  )
}
