"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown, ArrowLeft, Search, ArrowRight, Send, User, CreditCard, CheckCircle } from "lucide-react"
import { transactionService, paymentMethodService, recipientService } from "@/lib/database"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import type { Currency } from "@/types"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { refreshRecipients } from "@/lib/recipient-utils" // Import refreshRecipients

interface RecipientData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  bankName: string
  accountNumber: string
  routingNumber: string
  swiftCode: string
}

interface ConversionData {
  sendAmount: string
  sendCurrency: string
  receiveCurrency: string
  receiveAmount: number
  exchangeRate: number
  fee: number
}

export default function UserSendPage() {
  return (
    <ProtectedRoute>
      <SendMoneyContent />
    </ProtectedRoute>
  )
}

function SendMoneyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const { currencies, exchangeRates, recipients, loading } = useUserData()

  // Initialize state with default values
  const [currentStep, setCurrentStep] = useState(1)
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("")
  const [receiveAmount, setReceiveAmount] = useState<string>("0")
  const [fee, setFee] = useState<number>(0)

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  // const [loading, setLoading] = useState(true) // This loading state is shadowed by useUserData's loading
  const [error, setError] = useState<string | null>("")

  const [recipientData, setRecipientData] = useState<RecipientData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
  })
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [purpose, setPurpose] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  // const [error, setError] = useState("") // This error state is shadowed by the above error state
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [transactionId, setTransactionId] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
  })

  const [conversionData, setConversionData] = useState<ConversionData | null>(null)

  // Load data from URL params if available
  useEffect(() => {
    const step = searchParams.get("step")
    const sendAmount = searchParams.get("sendAmount")
    const sendCurrency = searchParams.get("sendCurrency")
    const receiveCurrency = searchParams.get("receiveCurrency")
    const receiveAmount = searchParams.get("receiveAmount")
    const exchangeRate = searchParams.get("exchangeRate")
    const fee = searchParams.get("fee")

    if (step && sendAmount && sendCurrency && receiveCurrency && receiveAmount && exchangeRate && fee) {
      setCurrentStep(Number.parseInt(step))
      setConversionData({
        sendAmount,
        sendCurrency,
        receiveCurrency,
        receiveAmount: Number.parseFloat(receiveAmount),
        exchangeRate: Number.parseFloat(exchangeRate),
        fee: Number.parseFloat(fee),
      })
    }
  }, [searchParams])

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

  // Add this state near the other state declarations
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] = useState(false)

  // Currency dropdown states
  const [sendCurrencySearch, setSendCurrencySearch] = useState<string>("")
  const [receiveCurrencySearch, setReceiveCurrencySearch] = useState<string>("")
  const [sendDropdownOpen, setSendDropdownOpen] = useState<boolean>(false)
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState<boolean>(false)

  const sendDropdownRef = useRef<HTMLDivElement>(null)
  const receiveDropdownRef = useRef<HTMLDivElement>(null)

  // Add state for tracking which field was last edited
  const [lastEditedField, setLastEditedField] = useState<"send" | "receive">("send")

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const paymentMethodsData = await paymentMethodService.getAll()
        setPaymentMethods(paymentMethodsData || [])
      } catch (error) {
        console.error("Error loading payment methods:", error)
      }
    }

    loadPaymentMethods()
  }, [])

  // Set default currencies when data is loaded
  useEffect(() => {
    if (currencies.length > 0 && userProfile) {
      const userBaseCurrency = userProfile.base_currency || "USD"
      const baseCurrencyExists = currencies.find((c) => c.code === userBaseCurrency)

      if (baseCurrencyExists) {
        setSendCurrency(userBaseCurrency)
        // Set receive currency to a different one
        const otherCurrency = currencies.find((c) => c.code !== userBaseCurrency)
        if (otherCurrency) {
          setReceiveCurrency(otherCurrency.code)
        }
      } else {
        // Fallback to first two currencies
        setSendCurrency(currencies[0].code)
        if (currencies.length > 1) {
          setReceiveCurrency(currencies[1].code)
        }
      }
      // setLoading(false); // This loading state is shadowed by useUserData's loading
    }
  }, [currencies, userProfile])

  // Generate transaction ID when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && !transactionId) {
      const newTransactionId = `NP${Date.now()}`
      setTransactionId(newTransactionId)
    }
  }, [currentStep, transactionId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sendDropdownRef.current && !sendDropdownRef.current.contains(event.target as Node)) {
        setSendDropdownOpen(false)
        setSendCurrencySearch("")
      }
      if (receiveDropdownRef.current && !receiveDropdownRef.current.contains(event.target as Node)) {
        setReceiveDropdownOpen(false)
        setReceiveCurrencySearch("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Filter currencies based on search
  const filterCurrencies = (searchTerm: string) => {
    if (!searchTerm) return currencies
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

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
      email: recipient.email || "",
      phone: recipient.phone_number || "",
      address: recipient.address || "",
      city: recipient.city || "",
      country: recipient.country || "",
      bankName: recipient.bank_name,
      accountNumber: recipient.account_number,
      routingNumber: recipient.routing_number || "",
      swiftCode: recipient.swift_code || "",
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

      // Refresh recipients data
      await refreshRecipients()

      // Select the new recipient
      handleSelectRecipient(newRecipient)

      // Clear form and close dialog
      setNewRecipientData({
        fullName: "",
        accountNumber: "",
        bankName: "",
      })

      // Close the dialog
      setIsAddRecipientDialogOpen(false)
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
    return exchangeRates.find((r) => r.from_currency === from && r.to_currency === to)
  }

  const calculateFee = (amount: number, from: string, to: string) => {
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

  // Custom Currency Dropdown Component
  const CurrencyDropdown = ({
    selectedCurrency,
    onCurrencyChange,
    searchTerm,
    onSearchChange,
    isOpen,
    onToggle,
    dropdownRef,
  }: {
    selectedCurrency: string
    onCurrencyChange: (currency: string) => void
    searchTerm: string
    onSearchChange: (search: string) => void
    isOpen: boolean
    onToggle: () => void
    dropdownRef: React.RefObject<HTMLDivElement>
  }) => {
    const filteredCurrencies = filterCurrencies(searchTerm)
    const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency)

    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          className="bg-white border-gray-200 rounded-full px-3 py-1.5 h-auto hover:bg-gray-50 flex-shrink-0"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {selectedCurrencyData && <FlagIcon currency={selectedCurrencyData} />}
            <span className="font-medium text-sm">{selectedCurrency}</span>
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </div>
        </Button>

        {isOpen && (
          <div
            className={`absolute right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
              dropdownRef === receiveDropdownRef ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {/* Search Bar */}
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search currencies..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 h-9"
                  autoFocus
                />
              </div>
            </div>

            {/* Currency List - Show 3 items in preview, rest scroll */}
            <div className="max-h-[180px] overflow-y-auto">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    onClick={() => {
                      onCurrencyChange(currency.code)
                      onSearchChange("")
                      onToggle()
                    }}
                    className="flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gray-50 min-h-[60px]"
                  >
                    <FlagIcon currency={currency} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{currency.code}</div>
                      <div className="text-xs text-muted-foreground truncate">{currency.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500">No currencies found</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
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

  const handleConversionSubmit = (data: ConversionData) => {
    setConversionData(data)
    setCurrentStep(2)
  }

  const handleRecipientSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentStep(3)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!conversionData || !userProfile) return

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sendAmount: Number.parseFloat(conversionData.sendAmount),
          sendCurrency: conversionData.sendCurrency,
          receiveCurrency: conversionData.receiveCurrency,
          receiveAmount: conversionData.receiveAmount,
          exchangeRate: conversionData.exchangeRate,
          fee: conversionData.fee,
          recipient: recipientData,
          purpose,
          userId: userProfile.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create transaction")
      }

      const result = await response.json()
      router.push(`/user/send/${result.transactionId}`)
    } catch (err: any) {
      setError(err.message || "Failed to create transaction")
    } finally {
      setIsSubmitting(false)
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

    const rate = getExchangeRate(sendCurrency, receiveCurrency)

    if (lastEditedField === "send") {
      // Calculate receive amount from send amount
      const amount = Number.parseFloat(sendAmount) || 0
      const feeData = calculateFee(amount, sendCurrency, receiveCurrency)

      if (rate) {
        const converted = amount * rate.rate
        setReceiveAmount(converted.toFixed(2))
      } else {
        setReceiveAmount("0")
      }

      setFee(feeData.fee)
      setFeeType(feeData.feeType)
    } else {
      // Calculate send amount from receive amount (reverse calculation)
      const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0

      if (rate && rate.rate > 0) {
        // To get the target receive amount, we need to work backwards
        // receiveAmount = sendAmount * rate
        // So: sendAmount = receiveAmount / rate
        const requiredSendAmount = targetReceiveAmount / rate.rate
        setSendAmount(requiredSendAmount.toFixed(2))

        // Calculate fee based on the required send amount
        const feeData = calculateFee(requiredSendAmount, sendCurrency, receiveCurrency)
        setFee(feeData.fee)
        setFeeType(feeData.feeType)
      } else {
        setSendAmount("0")
        setFee(0)
      }
    }
  }, [sendAmount, receiveAmount, sendCurrency, receiveCurrency, exchangeRates, lastEditedField])

  // Add new useEffect to handle min/max amounts when currency changes
  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return

    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (rate && rate.min_amount) {
      const currentAmount = Number.parseFloat(sendAmount) || 0
      if (currentAmount < rate.min_amount) {
        setSendAmount(rate.min_amount.toString())
      }
    }
  }, [sendCurrency, receiveCurrency, exchangeRates])

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
          receiveAmount: Number.parseFloat(receiveAmount),
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
            <span className="font-semibold">
              {formatCurrency(Number.parseFloat(receiveAmount) || 0, receiveCurrency)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate</span>
            <span className="text-sm">
              1 {sendCurrency} = {exchangeRateData?.rate.toFixed(4)} {receiveCurrency}
            </span>
          </div>
        </div>

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

  const formatCurrency2 = (amount: number, currencyCode: string) => {
    const currency = currencies.find((c) => c.code === currencyCode)
    return `${currency?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

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
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
            <p className="text-gray-600">Transfer money to your recipients</p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep ? "bg-novapay-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  <div className="ml-2 text-sm">
                    {step === 1 && "Amount"}
                    {step === 2 && "Recipient"}
                    {step === 3 && "Review"}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-0.5 ml-4 ${step < currentStep ? "bg-novapay-primary" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" style={{ visibility: "hidden", height: 0 }} />
          </div>

          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Amount to Send */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Enter Amount
                    </CardTitle>
                    <CardDescription>How much would you like to send?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      {/* Currency Converter Component would go here */}
                      <p className="text-center text-gray-600">Currency converter component</p>
                      <Button
                        className="w-full mt-4 bg-novapay-primary hover:bg-novapay-primary-600"
                        onClick={() => setCurrentStep(2)}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Add Recipient */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Recipient Details
                    </CardTitle>
                    <CardDescription>Who are you sending money to?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRecipientSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name *</Label>
                          <Input
                            id="fullName"
                            value={recipientData.fullName}
                            onChange={(e) => setRecipientData({ ...recipientData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={recipientData.email}
                            onChange={(e) => setRecipientData({ ...recipientData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={recipientData.phone}
                            onChange={(e) => setRecipientData({ ...recipientData, phone: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            value={recipientData.country}
                            onChange={(e) => setRecipientData({ ...recipientData, country: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back
                        </Button>
                        <Button type="submit" className="bg-novapay-primary hover:bg-novapay-primary-600">
                          Continue
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && conversionData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Send className="h-5 w-5 mr-2" />
                      Review & Send
                    </CardTitle>
                    <CardDescription>Please review your transaction details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Transaction Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Transaction Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>You send:</span>
                            <span className="font-medium">
                              {formatCurrency2(
                                Number.parseFloat(conversionData.sendAmount),
                                conversionData.sendCurrency,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Recipient gets:</span>
                            <span className="font-medium">
                              {formatCurrency2(conversionData.receiveAmount, conversionData.receiveCurrency)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Exchange rate:</span>
                            <span>
                              1 {conversionData.sendCurrency} = {conversionData.exchangeRate}{" "}
                              {conversionData.receiveCurrency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fee:</span>
                            <span>{formatCurrency2(conversionData.fee, conversionData.sendCurrency)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recipient Details */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Recipient Details</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Name:</span> {recipientData.fullName}
                          </p>
                          <p>
                            <span className="font-medium">Email:</span> {recipientData.email}
                          </p>
                          <p>
                            <span className="font-medium">Phone:</span> {recipientData.phone}
                          </p>
                          <p>
                            <span className="font-medium">Country:</span> {recipientData.country}
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleFinalSubmit}>
                        <div className="mb-4">
                          <Label htmlFor="purpose">Purpose of Transfer</Label>
                          <Textarea
                            id="purpose"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g., Family support, business payment, etc."
                            rows={3}
                          />
                        </div>

                        <div className="flex space-x-4">
                          <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-novapay-primary hover:bg-novapay-primary-600"
                          >
                            {isSubmitting ? "Processing..." : "Send Money"}
                            <Send className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </form>
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
