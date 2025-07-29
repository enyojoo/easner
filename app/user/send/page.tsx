"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight, ArrowLeft, Plus, User, CreditCard, CheckCircle } from "lucide-react"
import { currencyService, recipientService, paymentMethodService, transactionService } from "@/lib/database"

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
  flag: string
}

interface ExchangeRate {
  id: string
  from_currency: string
  to_currency: string
  rate: number
  fee_type: string
  fee_amount: number
}

interface Recipient {
  id: string
  full_name: string
  account_number: string
  bank_name: string
  currency: string
  phone_number?: string
}

interface PaymentMethod {
  id: string
  currency: string
  type: string
  name: string
  account_name?: string
  account_number?: string
  bank_name?: string
  qr_code_data?: string
  instructions?: string
  is_default: boolean
  status: string
}

function SendPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Data state
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])

  // Form state
  const [sendAmount, setSendAmount] = useState("")
  const [sendCurrency, setSendCurrency] = useState("USD")
  const [receiveCurrency, setReceiveCurrency] = useState("NGN")
  const [receiveAmount, setReceiveAmount] = useState("")
  const [exchangeRate, setExchangeRate] = useState(0)
  const [feeAmount, setFeeAmount] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  // Recipient state
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [newRecipient, setNewRecipient] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })
  const [showNewRecipientForm, setShowNewRecipientForm] = useState(false)

  // Payment state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [paymentReference, setPaymentReference] = useState("")

  // Transaction state
  const [transactionId, setTransactionId] = useState("")

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        setLoading(true)
        const [currenciesData, ratesData, recipientsData, paymentMethodsData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
          recipientService.getByUserId(user.id),
          paymentMethodService.getAll(),
        ])

        setCurrencies(currenciesData)
        setExchangeRates(ratesData)
        setRecipients(recipientsData)
        setPaymentMethods(paymentMethodsData)

        // Set smart defaults based on user's base currency
        if (user.base_currency) {
          setSendCurrency(user.base_currency)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please refresh the page.")

        // Fallback to static data
        setCurrencies([
          { id: "1", code: "USD", name: "US Dollar", symbol: "$", flag: "/flags/usa.svg" },
          { id: "2", code: "NGN", name: "Nigerian Naira", symbol: "₦", flag: "/flags/nigeria.svg" },
          { id: "3", code: "GBP", name: "British Pound", symbol: "£", flag: "/flags/uk.svg" },
          { id: "4", code: "EUR", name: "Euro", symbol: "€", flag: "/flags/eu.svg" },
          { id: "5", code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "/flags/canada.svg" },
        ])
        setExchangeRates([
          { id: "1", from_currency: "USD", to_currency: "NGN", rate: 1650, fee_type: "free", fee_amount: 0 },
          { id: "2", from_currency: "GBP", to_currency: "NGN", rate: 2100, fee_type: "free", fee_amount: 0 },
          { id: "3", from_currency: "EUR", to_currency: "NGN", rate: 1800, fee_type: "free", fee_amount: 0 },
          { id: "4", from_currency: "CAD", to_currency: "NGN", rate: 1200, fee_type: "free", fee_amount: 0 },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Handle URL parameters from homepage
  useEffect(() => {
    const urlSendAmount = searchParams.get("sendAmount")
    const urlSendCurrency = searchParams.get("sendCurrency")
    const urlReceiveAmount = searchParams.get("receiveAmount")
    const urlReceiveCurrency = searchParams.get("receiveCurrency")
    const urlExchangeRate = searchParams.get("exchangeRate")

    if (urlSendAmount && urlSendCurrency && urlReceiveAmount && urlReceiveCurrency && urlExchangeRate) {
      setSendAmount(urlSendAmount)
      setSendCurrency(urlSendCurrency)
      setReceiveAmount(urlReceiveAmount)
      setReceiveCurrency(urlReceiveCurrency)
      setExchangeRate(Number.parseFloat(urlExchangeRate))
      setCurrentStep(2) // Skip to recipient selection
    }
  }, [searchParams])

  // Handle session storage data (from login redirect)
  useEffect(() => {
    const pendingTransaction = sessionStorage.getItem("pendingTransaction")
    if (pendingTransaction) {
      try {
        const data = JSON.parse(pendingTransaction)
        setSendAmount(data.sendAmount.toString())
        setSendCurrency(data.sendCurrency)
        setReceiveAmount(data.receiveAmount.toString())
        setReceiveCurrency(data.receiveCurrency)
        setExchangeRate(data.exchangeRate)
        setCurrentStep(2) // Skip to recipient selection
        sessionStorage.removeItem("pendingTransaction")
      } catch (error) {
        console.error("Error parsing pending transaction:", error)
      }
    }
  }, [])

  // Calculate exchange rate and amounts
  useEffect(() => {
    if (!sendAmount || sendCurrency === receiveCurrency) {
      setReceiveAmount("")
      setExchangeRate(0)
      setFeeAmount(0)
      setTotalAmount(0)
      return
    }

    const rate = exchangeRates.find((r) => r.from_currency === sendCurrency && r.to_currency === receiveCurrency)

    if (rate) {
      const amount = Number.parseFloat(sendAmount)
      if (!isNaN(amount)) {
        const converted = amount * rate.rate
        const fee = rate.fee_type === "percentage" ? amount * (rate.fee_amount / 100) : rate.fee_amount

        setReceiveAmount(converted.toFixed(2))
        setExchangeRate(rate.rate)
        setFeeAmount(fee)
        setTotalAmount(amount + fee)
      }
    }
  }, [sendAmount, sendCurrency, receiveCurrency, exchangeRates])

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleCreateRecipient = async () => {
    if (!user || !newRecipient.fullName || !newRecipient.accountNumber || !newRecipient.bankName) {
      setError("Please fill in all required recipient fields")
      return
    }

    try {
      setLoading(true)
      const recipient = await recipientService.create(user.id, {
        fullName: newRecipient.fullName,
        accountNumber: newRecipient.accountNumber,
        bankName: newRecipient.bankName,
        phoneNumber: newRecipient.phoneNumber,
        currency: receiveCurrency,
      })

      setRecipients((prev) => [recipient, ...prev])
      setSelectedRecipient(recipient.id)
      setShowNewRecipientForm(false)
      setNewRecipient({ fullName: "", accountNumber: "", bankName: "", phoneNumber: "" })
      setError("")
    } catch (error) {
      console.error("Error creating recipient:", error)
      setError("Failed to create recipient. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async () => {
    if (!user || !selectedRecipient) {
      setError("Please select a recipient")
      return
    }

    try {
      setLoading(true)
      const transaction = await transactionService.create({
        userId: user.id,
        recipientId: selectedRecipient,
        sendAmount: Number.parseFloat(sendAmount),
        sendCurrency,
        receiveAmount: Number.parseFloat(receiveAmount),
        receiveCurrency,
        exchangeRate,
        feeAmount,
        feeType: "free",
        totalAmount,
      })

      setTransactionId(transaction.transaction_id)
      handleNextStep()
    } catch (error) {
      console.error("Error creating transaction:", error)
      setError("Failed to create transaction. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getSendCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === sendCurrency)
    return currency?.symbol || "$"
  }

  const getReceiveCurrencySymbol = () => {
    const currency = currencies.find((c) => c.code === receiveCurrency)
    return currency?.symbol || "₦"
  }

  const getAvailablePaymentMethods = () => {
    return paymentMethods.filter((pm) => pm.currency === sendCurrency && pm.status === "active")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to send money</h2>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 ${step < currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Amount</span>
            <span>Recipient</span>
            <span>Payment</span>
            <span>Complete</span>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Amount */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>How much do you want to send?</CardTitle>
              <CardDescription>Enter the amount and select currencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>You Send</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={sendCurrency} onValueChange={setSendCurrency}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Recipient Gets</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={
                        receiveAmount
                          ? `${getReceiveCurrencySymbol()}${Number.parseFloat(receiveAmount).toLocaleString()}`
                          : ""
                      }
                      readOnly
                      className="flex-1 bg-gray-50"
                      placeholder="0.00"
                    />
                    <Select value={receiveCurrency} onValueChange={setReceiveCurrency}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.id} value={currency.code}>
                            {currency.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {exchangeRate > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span>Exchange Rate:</span>
                    <span>
                      1 {sendCurrency} = {exchangeRate.toLocaleString()} {receiveCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Fee:</span>
                    <span>
                      {getSendCurrencySymbol()}
                      {feeAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium border-t pt-2 mt-2">
                    <span>Total:</span>
                    <span>
                      {getSendCurrencySymbol()}
                      {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleNextStep} disabled={!sendAmount || !receiveAmount}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Recipient */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Who are you sending money to?</CardTitle>
              <CardDescription>Select an existing recipient or add a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recipients.length > 0 && !showNewRecipientForm && (
                <div className="space-y-4">
                  <Label>Select Recipient</Label>
                  <div className="grid gap-4">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedRecipient === recipient.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedRecipient(recipient.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{recipient.full_name}</h3>
                            <p className="text-sm text-gray-600">
                              {recipient.bank_name} • {recipient.account_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!showNewRecipientForm && (
                <Button variant="outline" onClick={() => setShowNewRecipientForm(true)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Recipient
                </Button>
              )}

              {showNewRecipientForm && (
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">Add New Recipient</Label>
                    <Button variant="ghost" size="sm" onClick={() => setShowNewRecipientForm(false)}>
                      Cancel
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={newRecipient.fullName}
                        onChange={(e) => setNewRecipient((prev) => ({ ...prev, fullName: e.target.value }))}
                        placeholder="Enter recipient's full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={newRecipient.phoneNumber}
                        onChange={(e) => setNewRecipient((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number *</Label>
                      <Input
                        value={newRecipient.accountNumber}
                        onChange={(e) => setNewRecipient((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bank Name *</Label>
                      <Input
                        value={newRecipient.bankName}
                        onChange={(e) => setNewRecipient((prev) => ({ ...prev, bankName: e.target.value }))}
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateRecipient}
                    disabled={
                      loading || !newRecipient.fullName || !newRecipient.accountNumber || !newRecipient.bankName
                    }
                    className="w-full"
                  >
                    {loading ? "Creating..." : "Add Recipient"}
                  </Button>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleNextStep} disabled={!selectedRecipient}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>How would you like to pay?</CardTitle>
              <CardDescription>Select a payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {getAvailablePaymentMethods().map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{method.name}</h3>
                        <p className="text-sm text-gray-600">{method.type}</p>
                        {method.instructions && <p className="text-sm text-gray-500 mt-1">{method.instructions}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Payment Reference (Optional)</Label>
                <Textarea
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Add a note for this payment"
                  rows={3}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handlePrevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={handleCreateTransaction} disabled={loading || !selectedPaymentMethod}>
                  {loading ? "Processing..." : "Create Transaction"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Complete */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-green-600">Transaction Created Successfully!</CardTitle>
              <CardDescription className="text-center">
                Your transaction has been created. Please complete the payment to process your transfer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">Transaction ID: {transactionId}</h3>
                <p className="text-gray-600">You will receive email updates about your transaction status.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Send Amount:</span>
                  <span>
                    {getSendCurrencySymbol()}
                    {Number.parseFloat(sendAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Exchange Rate:</span>
                  <span>
                    1 {sendCurrency} = {exchangeRate.toLocaleString()} {receiveCurrency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>
                    {getSendCurrencySymbol()}
                    {feeAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total:</span>
                  <span>
                    {getSendCurrencySymbol()}
                    {totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Recipient Gets:</span>
                  <span>
                    {getReceiveCurrencySymbol()}
                    {Number.parseFloat(receiveAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button onClick={() => router.push("/user/transactions")}>View Transactions</Button>
                <Button variant="outline" onClick={() => router.push(`/user/send/${transactionId}`)}>
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserDashboardLayout>
  )
}

export default function SendPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SendPageContent />
    </Suspense>
  )
}
