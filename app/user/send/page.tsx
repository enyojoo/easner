"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/auth/protected-route"
import UserDashboardLayout from "@/components/layouts/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Search,
  Upload,
  X,
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  QrCode,
  Building2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState, useEffect, useRef } from "react"
import type { Currency, ExchangeRate } from "@/types"
import { currencyService, recipientService, paymentMethodService, transactionService } from "@/services"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

function UserSendContent() {
  // All the existing component code stays exactly the same
  const router = useRouter()
  const { userProfile } = useAuth()

  // Initialize state with default values
  const [currentStep, setCurrentStep] = useState(1)
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("")
  const [receiveAmount, setReceiveAmount] = useState<number>(0)
  const [fee, setFee] = useState<number>(0)

  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [recipients, setRecipients] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [recipientData, setRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [transactionId, setTransactionId] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
  })

  // Copy feedback states
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [feeType, setFeeType] = useState<string>("free")
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)

  // All the existing useEffect hooks and functions stay exactly the same
  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) return

      try {
        setLoading(true)
        setError(null)

        const [currenciesData, ratesData, recipientsData, paymentMethodsData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
          recipientService.getByUserId(userProfile.id),
          paymentMethodService.getAll(),
        ])

        setCurrencies(currenciesData || [])
        setExchangeRates(ratesData || [])
        setRecipients(recipientsData || [])
        setPaymentMethods(paymentMethodsData || [])

        // Set default currencies if available
        if (currenciesData && currenciesData.length > 0) {
          // Set user's base currency as default send currency, or first available
          const userBaseCurrency = userProfile.base_currency || "NGN"
          const baseCurrencyExists = currenciesData.find((c) => c.code === userBaseCurrency)

          if (baseCurrencyExists) {
            setSendCurrency(userBaseCurrency)
            // Set receive currency to a different one
            const otherCurrency = currenciesData.find((c) => c.code !== userBaseCurrency)
            if (otherCurrency) {
              setReceiveCurrency(otherCurrency.code)
            }
          } else {
            // Fallback to first two currencies
            setSendCurrency(currenciesData[0].code)
            if (currenciesData.length > 1) {
              setReceiveCurrency(currenciesData[1].code)
            }
          }
        }
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [userProfile?.id, userProfile?.base_currency])

  // Generate transaction ID when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && !transactionId) {
      const newTransactionId = `NP${Date.now()}`
      setTransactionId(newTransactionId)
    }
  }, [currentStep, transactionId])

  const filteredSavedRecipients = recipients.filter(
    (recipient) =>
      (recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.account_number.includes(searchTerm)) &&
      recipient.currency === receiveCurrency,
  )

  const handleSelectRecipient = (recipient: any) => {
    setSelectedRecipientId(recipient.id)
    setRecipientData({
      fullName: recipient.full_name,
      accountNumber: recipient.account_number,
      bankName: recipient.bank_name,
      phoneNumber: recipient.phone_number || "",
    })
  }

  const handleAddNewRecipient = async () => {
    if (!userProfile?.id) return

    try {
      const newRecipient = await recipientService.create(userProfile.id, {
        fullName: newRecipientData.fullName,
        accountNumber: newRecipientData.accountNumber,
        bankName: newRecipientData.bankName,
        currency: receiveCurrency,
      })

      // Add to local state
      setRecipients((prev) => [newRecipient, ...prev])

      // Select the new recipient
      handleSelectRecipient(newRecipient)

      // Clear form and close dialog
      setNewRecipientData({
        fullName: "",
        accountNumber: "",
        bankName: "",
      })
    } catch (error) {
      console.error("Error adding recipient:", error)
      setError("Failed to add recipient. Please try again.")
    }
  }

  // Copy to clipboard with feedback
  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates((prev) => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // File upload handlers
  const handleFileSelect = async (file: File) => {
    // Clear previous errors
    setUploadError(null)

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and PDF files are allowed")
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate progress for better UX (don't actually upload until transaction exists)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 100)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDismissUploadError = () => {
    setUploadError(null)
  }

  // Exchange rate and fee calculation functions
  const getExchangeRate = (from: string, to: string) => {
    // Same currency pair returns 1:1 rate
    if (from === to) {
      return {
        id: "same",
        from_currency: from,
        to_currency: to,
        rate: 1,
        fee_type: "free" as const,
        fee_amount: 0,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return exchangeRates.find((r) => r.from_currency === from && r.to_currency === to)
  }

  const calculateFee = (amount: number, from: string, to: string) => {
    // Same currency pair has no fee
    if (from === to) {
      return { fee: 0, feeType: "free" }
    }

    const rateData = getExchangeRate(from, to)
    if (!rateData || rateData.fee_type === "free") {
      return { fee: 0, feeType: "free" }
    }

    if (rateData.fee_type === "fixed") {
      return { fee: rateData.fee_amount, feeType: "fixed" }
    }

    if (rateData.fee_type === "percentage") {
      return { fee: (amount * rateData.fee_amount) / 100, feeType: "percentage" }
    }

    return { fee: 0, feeType: "free" }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Component to render flag SVG safely
  const FlagIcon = ({ currency }: { currency: Currency }) => {
    if (!currency.flag) return null

    // If flag is already an SVG string, render it directly
    if (currency.flag.startsWith("<svg")) {
      return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
    }

    // If flag is a URL or path, render as img
    if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
      return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={20} height={20} />
    }

    // Fallback to text
    return <span className="text-xs">{currency.code}</span>
  }

  // Handle currency selection with same currency prevention
  const handleSendCurrencyChange = (newCurrency: string) => {
    setSendCurrency(newCurrency)
    // If user selects same currency as receive, swap them
    if (newCurrency === receiveCurrency) {
      setReceiveCurrency(sendCurrency)
    }
  }

  const handleReceiveCurrencyChange = (newCurrency: string) => {
    setReceiveCurrency(newCurrency)
    // If user selects same currency as send, swap them
    if (newCurrency === sendCurrency) {
      setSendCurrency(receiveCurrency)
    }
  }

  // Get payment methods for the sending currency
  const getPaymentMethodsForCurrency = (currency: string) => {
    return paymentMethods.filter((pm) => pm.currency === currency && pm.status === "active")
  }

  const getDefaultPaymentMethod = (currency: string) => {
    const methods = getPaymentMethodsForCurrency(currency)
    return methods.find((pm) => pm.is_default) || methods[0]
  }

  // Update the useEffect to calculate fee and conversion
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const amount = Number.parseFloat(sendAmount) || 0

    // If same currency, 1:1 conversion
    if (sendCurrency === receiveCurrency) {
      setReceiveAmount(amount)
      setFee(0)
      setFeeType("free")
      return
    }

    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    const feeData = calculateFee(amount, sendCurrency, receiveCurrency)

    if (rate) {
      const converted = amount * rate.rate
      setReceiveAmount(converted)
    } else {
      setReceiveAmount(0)
    }

    setFee(feeData.fee)
    setFeeType(feeData.feeType)
  }, [sendAmount, sendCurrency, receiveCurrency, exchangeRates])

  // Timer countdown
  useEffect(() => {
    if (currentStep === 3 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep, timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleContinue = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 3) {
      // Create transaction in database
      if (!userProfile?.id || !selectedRecipientId) return

      try {
        setIsCreatingTransaction(true)

        const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)
        if (!exchangeRateData) {
          throw new Error("Exchange rate not available")
        }

        const transaction = await transactionService.create({
          userId: userProfile.id,
          recipientId: selectedRecipientId,
          sendAmount: Number.parseFloat(sendAmount),
          sendCurrency,
          receiveAmount,
          receiveCurrency,
          exchangeRate: exchangeRateData.rate,
          feeAmount: fee,
          feeType: feeType,
          totalAmount: Number.parseFloat(sendAmount) + fee,
        })

        // Upload receipt if file was selected and upload completed successfully
        if (uploadedFile && uploadProgress === 100 && !isUploading) {
          try {
            await transactionService.uploadReceipt(transaction.transaction_id, uploadedFile)
          } catch (uploadError) {
            console.error("Error uploading receipt:", uploadError)
            // Don't block transaction creation if receipt upload fails
            setUploadError("Receipt upload failed, but transaction was created successfully")
          }
        }

        // Redirect to transaction status page
        router.push(`/user/send/${transaction.transaction_id.toLowerCase()}`)
      } catch (error) {
        console.error("Error creating transaction:", error)
        setError("Failed to create transaction. Please try again.")
      } finally {
        setIsCreatingTransaction(false)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)
  const exchangeRate = exchangeRateData?.rate || 0
  const sendCurrencyData = currencies.find((c) => c.code === sendCurrency)
  const receiveCurrencyData = currencies.find((c) => c.code === receiveCurrency)

  const steps = [
    { number: 1, title: "Amount to Send", completed: currentStep > 1 },
    { number: 2, title: "Add Recipient", completed: currentStep > 2 },
    { number: 3, title: "Make Payment", completed: currentStep > 3 },
    { number: 4, title: "Transaction Status", completed: false },
  ]

  const TransactionSummary = () => (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg">Transaction Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">You Send</span>
            <span className="font-semibold">{formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fee</span>
            <span className={`font-semibold ${fee === 0 ? "text-green-600" : "text-gray-900"}`}>
              {fee === 0 ? "FREE" : formatCurrency(fee, sendCurrency)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-gray-600">Total to Pay</span>
            <span className="font-semibold text-lg">
              {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Recipient Gets</span>
            <span className="font-semibold">{formatCurrency(receiveAmount, receiveCurrency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate</span>
            <span className="text-sm">
              1 {sendCurrency} = {exchangeRateData?.rate.toFixed(4)} {receiveCurrency}
            </span>
          </div>
        </div>

        {/* Same Currency Notice */}
        {sendCurrency === receiveCurrency && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs">ℹ</span>
              </div>
              <span className="text-sm text-blue-700">Same currency transfer - 1:1 conversion</span>
            </div>
          </div>
        )}

        {currentStep >= 2 && recipientData.fullName && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Recipient</h4>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{recipientData.fullName}</p>
              <p className="text-gray-600">{recipientData.accountNumber}</p>
              <p className="text-gray-600">{recipientData.bankName}</p>
            </div>
          </div>
        )}
        {currentStep >= 3 && transactionId && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono text-sm">{transactionId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  if (error) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-2">
                Retry
              </Button>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  if (currencies.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-700">No currencies available. Please contact support.</p>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.completed
                        ? "bg-green-500 text-white"
                        : currentStep === step.number
                          ? "bg-novapay-primary text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : step.number}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-900 hidden sm:block">{step.title}</span>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-0.5 bg-gray-200 mx-4 hidden sm:block">
                      <div
                        className={`h-full transition-all duration-300 ${
                          step.completed ? "bg-green-500 w-full" : "bg-gray-200 w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Amount to Send */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amount to Send</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* You Send Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">You Send</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <input
                            type="number"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            className="text-3xl font-bold bg-transparent border-0 outline-none w-full"
                            placeholder="0.00"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                className="bg-white border-gray-200 rounded-full px-3 py-1.5 h-auto hover:bg-gray-50 flex-shrink-0"
                              >
                                <div className="flex items-center gap-2">
                                  {sendCurrencyData && <FlagIcon currency={sendCurrencyData} />}
                                  <span className="font-medium text-sm">{sendCurrency}</span>
                                  <ChevronDown className="h-3 w-3 text-gray-500" />
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {currencies.map((currency) => (
                                <DropdownMenuItem
                                  key={currency.code}
                                  onClick={() => handleSendCurrencyChange(currency.code)}
                                  className="flex items-center gap-3"
                                >
                                  <FlagIcon currency={currency} />
                                  <div>
                                    <div className="font-medium">{currency.code}</div>
                                    <div className="text-sm text-muted-foreground">{currency.name}</div>
                                  </div>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>

                    {/* Fee and Rate Information */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-xs">✓</span>
                          </div>
                          <span className="text-sm text-gray-600">Fee</span>
                        </div>
                        <span className={`font-medium ${fee === 0 ? "text-green-600" : "text-gray-900"}`}>
                          {fee === 0 ? "FREE" : formatCurrency(fee, sendCurrency)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-novapay-primary text-xs">%</span>
                          </div>
                          <span className="text-sm text-gray-600">Rate</span>
                        </div>
                        <span className="font-medium text-novapay-primary">
                          1 {sendCurrency} = {exchangeRate?.toFixed(4) || "0.0000"} {receiveCurrency}
                        </span>
                      </div>
                    </div>

                    {/* Same Currency Warning */}
                    {sendCurrency === receiveCurrency && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 text-xs">ℹ</span>
                          </div>
                          <span className="text-sm text-blue-700">
                            Same currency transfer - 1:1 conversion with no fees
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Receiver Gets Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">Receiver Gets</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-3xl font-bold text-gray-900 whitespace-nowrap overflow-x-auto scrollbar-hide max-w-[170px] sm:max-w-none">
                              {formatCurrency(receiveAmount, receiveCurrency)}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="bg-white border-gray-200 rounded-full px-3 py-1.5 h-auto hover:bg-gray-50"
                                >
                                  <div className="flex items-center gap-2">
                                    {receiveCurrencyData && <FlagIcon currency={receiveCurrencyData} />}
                                    <span className="font-medium text-sm">{receiveCurrency}</span>
                                    <ChevronDown className="h-3 w-3 text-gray-500" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {currencies.map((currency) => (
                                  <DropdownMenuItem
                                    key={currency.code}
                                    onClick={() => handleReceiveCurrencyChange(currency.code)}
                                    className="flex items-center gap-3"
                                  >
                                    <FlagIcon currency={currency} />
                                    <div>
                                      <div className="font-medium">{currency.code}</div>
                                      <div className="text-sm text-muted-foreground">{currency.name}</div>
                                    </div>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                      disabled={!sendCurrency || !receiveCurrency || !sendAmount}
                    >
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Add Recipient */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add Recipient</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        placeholder="Search recipients"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
                      />
                    </div>

                    {/* Add New Recipient Option */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-novapay-primary-200 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Plus className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-medium text-gray-900">Add new recipient</span>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </DialogTrigger>

                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add New Recipient</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientName">Full Name *</Label>
                            <Input
                              id="newRecipientName"
                              value={newRecipientData.fullName}
                              onChange={(e) => setNewRecipientData({ ...newRecipientData, fullName: e.target.value })}
                              placeholder="Enter recipient's full name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientAccount">Account Number *</Label>
                            <Input
                              id="newRecipientAccount"
                              value={newRecipientData.accountNumber}
                              onChange={(e) =>
                                setNewRecipientData({ ...newRecipientData, accountNumber: e.target.value })
                              }
                              placeholder="Enter account number"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientBank">Bank Name *</Label>
                            <Input
                              id="newRecipientBank"
                              value={newRecipientData.bankName}
                              onChange={(e) => setNewRecipientData({ ...newRecipientData, bankName: e.target.value })}
                              placeholder="Enter bank name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientCurrency">Currency</Label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                              {receiveCurrencyData && <FlagIcon currency={receiveCurrencyData} />}
                              <div>
                                <div className="font-medium">{receiveCurrency}</div>
                                <div className="text-sm text-gray-500">{receiveCurrencyData?.name}</div>
                              </div>
                              <span className="ml-auto text-xs text-gray-500">Auto-selected</span>
                            </div>
                          </div>
                          <Button
                            onClick={handleAddNewRecipient}
                            disabled={
                              !newRecipientData.fullName ||
                              !newRecipientData.accountNumber ||
                              !newRecipientData.bankName
                            }
                            className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                          >
                            Add Recipient
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Saved Recipients List */}
                    <div className="space-y-3">
                      {filteredSavedRecipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          onClick={() => handleSelectRecipient(recipient)}
                          className={`flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer transition-colors ${
                            selectedRecipientId === recipient.id
                              ? "border-novapay-primary bg-novapay-primary-50"
                              : "border-gray-100 hover:border-novapay-primary-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-novapay-primary-100 rounded-full flex items-center justify-center relative">
                              <span className="text-novapay-primary font-semibold text-sm">
                                {recipient.full_name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                              <div className="absolute -bottom-1 -right-1 w-6 h-4 rounded-sm overflow-hidden">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: currencies.find((c) => c.code === recipient.currency)?.flag || "",
                                  }}
                                  className="w-full h-full"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{recipient.full_name}</p>
                              <p className="text-sm text-gray-500">
                                {recipient.bank_name} - {recipient.account_number}
                              </p>
                            </div>
                          </div>
                          {selectedRecipientId === recipient.id && (
                            <div className="w-6 h-6 bg-novapay-primary rounded-full flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredSavedRecipients.length === 0 && searchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No recipients found matching "{searchTerm}"</p>
                      </div>
                    )}

                    {filteredSavedRecipients.length === 0 && !searchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No recipients found for {receiveCurrency}</p>
                        <p className="text-sm">Add a new recipient to get started</p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={!selectedRecipientId}
                        className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        Continue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment Instructions */}
              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Make Payment
                      <div className="flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method - Dynamic based on admin settings */}
                    <div className="bg-gradient-to-br from-novapay-primary-50 to-blue-50 rounded-xl p-4 border border-novapay-primary-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-novapay-primary rounded-lg flex items-center justify-center">
                          {sendCurrencyData && <FlagIcon currency={sendCurrencyData} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-novapay-primary">
                            {sendCurrency === receiveCurrency
                              ? `Transfer ${formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)}`
                              : `Transfer ${formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}`}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {sendCurrency === receiveCurrency
                              ? "Same currency transfer - no conversion needed"
                              : fee > 0
                                ? `Send amount: ${formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee: ${formatCurrency(fee, sendCurrency)}`
                                : "Send money to complete your transfer"}
                          </p>
                        </div>
                      </div>

                      {/* Render payment methods based on admin configuration */}
                      {(() => {
                        const paymentMethodsForCurrency = getPaymentMethodsForCurrency(sendCurrency)
                        const defaultMethod = getDefaultPaymentMethod(sendCurrency)

                        if (paymentMethodsForCurrency.length === 0) {
                          return (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                              <p className="text-red-700">No payment methods configured for {sendCurrency}</p>
                              <p className="text-red-600 text-sm">Please contact support</p>
                            </div>
                          )
                        }

                        return (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Payment Method Details */}
                            <div className="space-y-3">
                              {defaultMethod?.type === "bank_account" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">Account Name</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-sm">{defaultMethod.account_name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(defaultMethod.account_name, "accountName")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.accountName ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">Account Number</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium font-mono text-sm">
                                          {defaultMethod.account_number}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(defaultMethod.account_number, "accountNumber")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.accountNumber ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">Bank Name</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium text-sm">{defaultMethod.bank_name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(defaultMethod.bank_name, "bankName")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.bankName ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                      <span className="text-gray-600 text-xs">Transaction ID</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium font-mono text-xs">{transactionId}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(transactionId, "transactionId")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.transactionId ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {defaultMethod?.type === "qr_code" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                                  <div className="flex items-center justify-center gap-2 mb-3">
                                    <QrCode className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="w-32 h-32 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                    <QrCode className="h-16 w-16 text-gray-400" />
                                  </div>
                                  <div className="text-xs text-gray-600 mb-2">
                                    <p className="font-mono break-all">{defaultMethod.qr_code_data}</p>
                                  </div>
                                  {defaultMethod.instructions && (
                                    <p className="text-xs text-gray-500">{defaultMethod.instructions}</p>
                                  )}
                                  <div className="mt-2 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 text-xs">Transaction ID</span>
                                      <div className="flex items-center gap-1">
                                        <span className="font-medium font-mono text-xs">{transactionId}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(transactionId, "transactionId")}
                                          className="h-5 w-5 p-0"
                                        >
                                          {copiedStates.transactionId ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Important Instructions */}
                            <div className="space-y-3">
                              <h4 className="font-medium text-gray-900 text-xs uppercase tracking-wide">
                                Important Instructions
                              </h4>
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <ul className="text-xs text-amber-700 space-y-1.5">
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>
                                      Transfer exactly{" "}
                                      <strong>
                                        {sendCurrency === receiveCurrency
                                          ? formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)
                                          : formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                                      </strong>
                                      {sendCurrency !== receiveCurrency && fee > 0 && (
                                        <span className="text-xs block text-amber-600">
                                          (Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} +
                                          Fee: {formatCurrency(fee, sendCurrency)})
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>
                                      Include transaction ID <strong>{transactionId}</strong>
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>
                                      Complete within <strong>60 minutes</strong>
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>Upload receipt for faster processing</span>
                                  </li>
                                  {sendCurrency === receiveCurrency && (
                                    <li className="flex items-start gap-2">
                                      <span className="text-blue-500 mt-0.5 text-xs">•</span>
                                      <span className="text-blue-700">Same currency transfer - instant processing</span>
                                    </li>
                                  )}
                                  {defaultMethod?.type === "qr_code" && (
                                    <li className="flex items-start gap-2">
                                      <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                      <span>Scan QR code with your mobile banking app</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* Upload Receipt Section with Better Error Handling */}
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />

                      {/* Upload Error Alert */}
                      {uploadError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-red-700 font-medium">Upload Error</p>
                              <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDismissUploadError}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div
                        onClick={handleUploadClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                          isDragOver
                            ? "border-novapay-primary bg-novapay-primary-50"
                            : uploadedFile
                              ? "border-green-300 bg-green-50"
                              : uploadError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-novapay-primary-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              uploadedFile
                                ? "bg-green-100"
                                : uploadError
                                  ? "bg-red-100"
                                  : isDragOver
                                    ? "bg-novapay-primary-100"
                                    : "bg-gray-100 group-hover:bg-novapay-primary-50"
                            }`}
                          >
                            {uploadedFile ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : uploadError ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Upload
                                className={`h-5 w-5 transition-colors ${
                                  isDragOver ? "text-novapay-primary" : "text-gray-400"
                                }`}
                              />
                            )}
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium text-gray-900 text-sm">
                              {uploadedFile
                                ? uploadedFile.name
                                : uploadError
                                  ? "Upload Failed"
                                  : "Upload Payment Receipt"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {uploadedFile
                                ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                                : uploadError
                                  ? "Click to try again"
                                  : "JPG, PNG or PDF (Max 5MB)"}
                            </p>
                          </div>
                          {uploadedFile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        {/* Progress Bar (shown when uploading) */}
                        {isUploading && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Uploading...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-novapay-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          onClick={handleContinue}
                          disabled={isCreatingTransaction}
                          className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                        >
                          {isCreatingTransaction ? "Creating Transaction..." : "I've Completed Payment"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Transaction Summary Sidebar */}
            <div className="lg:col-span-1">
              <TransactionSummary />
            </div>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default function UserSendPage() {
  return (
    <ProtectedRoute>
      <UserSendContent />
    </ProtectedRoute>
  )
}
