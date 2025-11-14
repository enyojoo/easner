"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo, useCallback } from "react"

// WORKING CURRENCY DROPDOWN COMPONENT - OUTSIDE MAIN COMPONENT
const CurrencyDropdown = ({
  selectedCurrency,
  onCurrencyChange,
  searchTerm,
  onSearchChange,
  isOpen,
  onToggle,
  dropdownRef,
  currencies,
  type,
}: {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  isOpen: boolean
  onToggle: () => void
  dropdownRef: React.RefObject<HTMLDivElement>
  currencies: Currency[]
  type: "send" | "receive"
}) => {
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')

  const filteredCurrencies = useMemo(() => {
    let filtered = currencies

    // Filter by send/receive capability
    if (type === "send") {
      filtered = filtered.filter((currency) => currency.can_send !== false)
    } else if (type === "receive") {
      filtered = filtered.filter((currency) => currency.can_receive !== false)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
      (currency) =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    }

    return filtered
  }, [searchTerm, currencies, type])

  const selectedCurrencyData = useMemo(() => 
    currencies.find((c) => c.code === selectedCurrency), 
    [currencies, selectedCurrency]
  )

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = 200 // Approximate height of dropdown
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top

      // If not enough space below but enough space above, position up
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('up')
      } else {
        setDropdownPosition('down')
      }
    }
  }, [isOpen, dropdownRef])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="bg-white border border-gray-200 rounded-full px-3 py-1.5 h-auto hover:bg-gray-50 flex-shrink-0 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          {selectedCurrencyData && <FlagIcon currency={selectedCurrencyData} />}
          <span className="font-medium text-sm">{selectedCurrency}</span>
          <ChevronDown className="h-3 w-3 text-gray-500" />
        </div>
      </button>

      {isOpen && (
        <div className={`absolute right-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
          dropdownPosition === 'up' 
            ? 'bottom-full mb-1' 
            : 'top-full mt-1'
        }`}>
          {/* Arrow indicator */}
          <div className={`absolute right-4 w-0 h-0 ${
            dropdownPosition === 'up'
              ? 'top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200'
              : 'bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-200'
          }`}></div>
          
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

// FlagIcon component
const FlagIcon = ({ currency }: { currency: Currency }) => {
  if (!currency.flag) return null

  // If flag is already an SVG string, render it directly
  if (currency.flag.startsWith("<svg")) {
    return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
  }

  // If flag is a URL or path, render as img
  if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
    return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={24} height={24} />
  }

  // Fallback to text
  return <span className="text-xs">{currency.code}</span>
}
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  ChevronDown,
  Upload,
  Check,
  Clock,
  ArrowLeft,
  Copy,
  ChevronRight,
  Plus,
  Search,
  QrCode,
  Building2,
  AlertCircle,
  X,
} from "lucide-react"
import { transactionService, paymentMethodService, recipientService } from "@/lib/database"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import type { Currency } from "@/types"
import {
  getAccountTypeConfigFromCurrency,
  formatFieldValue,
} from "@/lib/currency-account-types"

export default function UserSendPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { currencies, exchangeRates, recipients, refreshRecipients } = useUserData()
  
  // Memoize exchangeRates to prevent infinite re-renders
  const memoizedExchangeRates = useMemo(() => exchangeRates, [exchangeRates])

  // Initialize state with default values
  const [currentStep, setCurrentStep] = useState(1)
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("")
  const [receiveAmount, setReceiveAmount] = useState<string>("0")
  const [fee, setFee] = useState<number>(0)

  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)

  const [recipientData, setRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })
  const [transactionId, setTransactionId] = useState<string>("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
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

  // Set default currencies when data is loaded - only if not already set
  useEffect(() => {
    if (currencies.length > 0 && userProfile && !sendCurrency && !receiveCurrency) {
      // Prioritize user's base currency from profile, otherwise USD, then first available currency that can send
      const userBaseCurrency = userProfile.base_currency || "USD"
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)
      
      if (availableSendCurrencies.length > 0) {
        // Check if user's base currency is available and can send
        const baseCurrencyExists = availableSendCurrencies.find((c) => c.code === userBaseCurrency)
        let newSendCurrency: string
        
        if (baseCurrencyExists) {
          newSendCurrency = userBaseCurrency
        } else {
          // Fallback to USD if available, otherwise first available
          const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
          newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        }
        
        setSendCurrency(newSendCurrency)
        
        // Set receive currency to first available currency that can receive (and is not the send currency)
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newSendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          // Prefer NGN if available, otherwise first available
          const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
          const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
          setReceiveCurrency(newReceiveCurrency)
        }
      }
      setLoading(false)
    } else if (currencies.length > 0 && !userProfile && !sendCurrency && !receiveCurrency) {
      // If no user profile, fallback to USD or first available
      const availableSendCurrencies = currencies.filter((c) => c.can_send !== false)
      if (availableSendCurrencies.length > 0) {
        const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
        const newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
        setSendCurrency(newSendCurrency)
        
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newSendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
          const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
          setReceiveCurrency(newReceiveCurrency)
        }
      }
      setLoading(false)
    } else if (currencies.length > 0 && sendCurrency && receiveCurrency) {
      // If currencies are already set, just stop loading
      setLoading(false)
    }
  }, [currencies, userProfile, sendCurrency, receiveCurrency])

  // Ensure receive currency can receive when currencies change
  useEffect(() => {
    if (currencies.length > 0 && sendCurrency && receiveCurrency) {
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== sendCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }, [currencies, sendCurrency, receiveCurrency])

  // Generate transaction ID when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && !transactionId) {
      const newTransactionId = `ETID${Date.now()}`
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
  const filterCurrencies = useMemo(() => {
    return (searchTerm: string) => {
      if (!searchTerm) return currencies
      return currencies.filter(
        (currency) =>
          currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
  }, [currencies])

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
        routingNumber: newRecipientData.routingNumber || undefined,
        sortCode: newRecipientData.sortCode || undefined,
        iban: newRecipientData.iban || undefined,
        swiftBic: newRecipientData.swiftBic || undefined,
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
        routingNumber: "",
        sortCode: "",
        iban: "",
        swiftBic: "",
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
    return memoizedExchangeRates.find((r) => r.from_currency === from && r.to_currency === to)
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
      return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={24} height={24} />
    }

    // Fallback to text
    return <span className="text-xs">{currency.code}</span>
  }


  // Memoized toggle functions to prevent infinite re-renders
  const toggleSendDropdown = useCallback(() => {
    setSendDropdownOpen(!sendDropdownOpen)
  }, [sendDropdownOpen])

  const toggleReceiveDropdown = useCallback(() => {
    setReceiveDropdownOpen(!receiveDropdownOpen)
  }, [receiveDropdownOpen])

  // Handle currency selection with same currency prevention
  const handleSendCurrencyChange = (newCurrency: string) => {
    setSendCurrency(newCurrency)
    // If user selects same currency as receive, find a different currency that can receive
    if (newCurrency === receiveCurrency) {
      const availableReceiveCurrencies = currencies.filter(
        (c) => c.can_receive !== false && c.code !== newCurrency
      )
      if (availableReceiveCurrencies.length > 0) {
        setReceiveCurrency(availableReceiveCurrencies[0].code)
      }
    } else {
      // Ensure receive currency can still receive
      const currentReceiveCurrency = currencies.find((c) => c.code === receiveCurrency)
      if (currentReceiveCurrency && currentReceiveCurrency.can_receive === false) {
        const availableReceiveCurrencies = currencies.filter(
          (c) => c.can_receive !== false && c.code !== newCurrency
        )
        if (availableReceiveCurrencies.length > 0) {
          setReceiveCurrency(availableReceiveCurrencies[0].code)
        }
      }
    }
  }

  const handleReceiveCurrencyChange = (newCurrency: string) => {
    setReceiveCurrency(newCurrency)
    // If user selects same currency as send, find a different currency that can send
    if (newCurrency === sendCurrency) {
      const availableSendCurrencies = currencies.filter(
        (c) => c.can_send !== false && c.code !== newCurrency
      )
      if (availableSendCurrencies.length > 0) {
        setSendCurrency(availableSendCurrencies[0].code)
      }
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
  }, [sendAmount, receiveAmount, sendCurrency, receiveCurrency, memoizedExchangeRates, lastEditedField])

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


  const handleResendVerificationEmail = async () => {
    if (!user?.email) return
    
    setIsResendingVerification(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })
      
      if (response.ok) {
        // Show success message
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert('Failed to send verification email. Please try again.')
      }
    } catch (error) {
      console.error('Error resending verification email:', error)
      alert('Failed to send verification email. Please try again.')
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleContinue = async () => {
    if (currentStep < 3) {
      // Check email verification before moving to step 2
      if (currentStep === 1 && !user?.email_confirmed_at) {
        setShowEmailVerificationModal(true)
        return
      }
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
                          ? "bg-easner-primary text-white"
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
                            onChange={(e) => {
                              setSendAmount(e.target.value)
                              setLastEditedField("send")
                            }}
                            onBlur={(e) => {
                              const value = Number.parseFloat(e.target.value) || 0
                              const rate = getExchangeRate(sendCurrency, receiveCurrency)
                              const minAmount = rate?.min_amount || 0
                              const maxAmount = rate?.max_amount

                              if (value < minAmount && minAmount > 0) {
                                setSendAmount(minAmount.toString())
                              } else if (maxAmount && value > maxAmount) {
                                setSendAmount(maxAmount.toString())
                              }
                            }}
                            className="text-3xl font-bold bg-transparent border-0 outline-none w-full"
                            placeholder="0.00"
                          />
                          <CurrencyDropdown
                            selectedCurrency={sendCurrency}
                            onCurrencyChange={handleSendCurrencyChange}
                            searchTerm={sendCurrencySearch}
                            onSearchChange={setSendCurrencySearch}
                            isOpen={sendDropdownOpen}
                            onToggle={toggleSendDropdown}
                            dropdownRef={sendDropdownRef}
                            currencies={currencies}
                            type="send"
                          />
                        </div>
                      </div>
                      {(() => {
                        const rate = getExchangeRate(sendCurrency, receiveCurrency)
                        if (rate && (rate.min_amount || rate.max_amount)) {
                          return (
                            <div className="text-xs text-gray-500 mt-2">
                              {rate.min_amount && `Min: ${formatCurrency(rate.min_amount, sendCurrency)}`}
                              {rate.min_amount && rate.max_amount && " • "}
                              {rate.max_amount && `Max: ${formatCurrency(rate.max_amount, sendCurrency)}`}
                            </div>
                          )
                        }
                        return null
                      })()}
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
                          <div className="w-5 h-5 bg-easner-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-easner-primary text-xs">%</span>
                          </div>
                          <span className="text-sm text-gray-600">Rate</span>
                        </div>
                        <span className="font-medium text-easner-primary">
                          1 {sendCurrency} = {exchangeRate?.toFixed(4) || "0.0000"} {receiveCurrency}
                        </span>
                      </div>
                    </div>

                    {/* Receiver Gets Section */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700">Receiver Gets</h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <input
                            type="number"
                            value={receiveAmount}
                            onChange={(e) => {
                              setReceiveAmount(e.target.value)
                              setLastEditedField("receive")
                            }}
                            onBlur={(e) => {
                              const targetReceiveAmount = Number.parseFloat(e.target.value) || 0
                              const rate = getExchangeRate(sendCurrency, receiveCurrency)

                              if (rate && targetReceiveAmount > 0) {
                                let requiredSendAmount = targetReceiveAmount / rate.rate

                                // Apply min/max constraints and adjust both fields if needed
                                if (rate.min_amount && requiredSendAmount < rate.min_amount) {
                                  requiredSendAmount = rate.min_amount
                                  const adjustedReceiveAmount = requiredSendAmount * rate.rate
                                  setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                                  setSendAmount(requiredSendAmount.toFixed(2))
                                } else if (rate.max_amount && requiredSendAmount > rate.max_amount) {
                                  requiredSendAmount = rate.max_amount
                                  const adjustedReceiveAmount = requiredSendAmount * rate.rate
                                  setReceiveAmount(adjustedReceiveAmount.toFixed(2))
                                  setSendAmount(requiredSendAmount.toFixed(2))
                                }
                              }
                            }}
                            className="text-3xl font-bold bg-transparent border-0 outline-none w-full"
                            placeholder="0.00"
                          />
                          <CurrencyDropdown
                            selectedCurrency={receiveCurrency}
                            onCurrencyChange={handleReceiveCurrencyChange}
                            searchTerm={receiveCurrencySearch}
                            onSearchChange={setReceiveCurrencySearch}
                            isOpen={receiveDropdownOpen}
                            onToggle={toggleReceiveDropdown}
                            dropdownRef={receiveDropdownRef}
                            currencies={currencies}
                            type="receive"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleContinue}
                      className="w-full bg-easner-primary hover:bg-easner-primary-600"
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
                    <Dialog open={isAddRecipientDialogOpen} onOpenChange={setIsAddRecipientDialogOpen}>
                      <DialogTrigger asChild>
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-easner-primary-200 cursor-pointer transition-colors">
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
                            <Label htmlFor="newRecipientCurrency">Currency</Label>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                              {receiveCurrencyData && <FlagIcon currency={receiveCurrencyData} />}
                              <div>
                                <div className="font-medium">{receiveCurrency}</div>
                              </div>
                              <span className="ml-auto text-xs text-gray-500">Auto-selected</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newRecipientName">Account Name *</Label>
                            <Input
                              id="newRecipientName"
                              value={newRecipientData.fullName}
                              onChange={(e) => setNewRecipientData({ ...newRecipientData, fullName: e.target.value })}
                              placeholder="Enter account name"
                              required
                            />
                          </div>
                          {(() => {
                            const accountConfig = receiveCurrency
                              ? getAccountTypeConfigFromCurrency(receiveCurrency)
                              : null

                            if (!accountConfig) {
                              return (
                                <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                                  Please select a currency first to see the required fields
                                </div>
                              )
                            }

                            return (
                              <>
                                {/* Bank Name - Always required */}
                          <div className="space-y-2">
                                  <Label htmlFor="newRecipientBank">
                                    {accountConfig.fieldLabels.bank_name} *
                                  </Label>
                                  <Input
                                    id="newRecipientBank"
                                    value={newRecipientData.bankName}
                                    onChange={(e) =>
                                      setNewRecipientData({ ...newRecipientData, bankName: e.target.value })
                                    }
                                    placeholder={accountConfig.fieldPlaceholders.bank_name}
                                    required
                                  />
                                </div>

                                {/* US Account Fields */}
                                {accountConfig.accountType === "us" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientRoutingNumber">
                                        {accountConfig.fieldLabels.routing_number} *
                                      </Label>
                                      <Input
                                        id="newRecipientRoutingNumber"
                                        value={newRecipientData.routingNumber}
                                        onChange={(e) => {
                                          const value = e.target.value.replace(/\D/g, "").slice(0, 9)
                                          setNewRecipientData({ ...newRecipientData, routingNumber: value })
                                        }}
                                        placeholder={accountConfig.fieldPlaceholders.routing_number}
                                        maxLength={9}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientAccount">
                                        {accountConfig.fieldLabels.account_number} *
                                      </Label>
                            <Input
                              id="newRecipientAccount"
                              value={newRecipientData.accountNumber}
                              onChange={(e) =>
                                setNewRecipientData({ ...newRecipientData, accountNumber: e.target.value })
                              }
                                        placeholder={accountConfig.fieldPlaceholders.account_number}
                              required
                            />
                          </div>
                                  </>
                                )}

                                {/* UK Account Fields */}
                                {accountConfig.accountType === "uk" && (
                                  <>
                                    <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                                        <Label htmlFor="newRecipientSortCode">
                                          {accountConfig.fieldLabels.sort_code} *
                                        </Label>
                            <Input
                                          id="newRecipientSortCode"
                                          value={newRecipientData.sortCode}
                                          onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                                            setNewRecipientData({ ...newRecipientData, sortCode: value })
                                          }}
                                          placeholder={accountConfig.fieldPlaceholders.sort_code}
                                          maxLength={6}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                                        <Label htmlFor="newRecipientAccount">
                                          {accountConfig.fieldLabels.account_number} *
                                        </Label>
                                        <Input
                                          id="newRecipientAccount"
                                          value={newRecipientData.accountNumber}
                                          onChange={(e) =>
                                            setNewRecipientData({ ...newRecipientData, accountNumber: e.target.value })
                                          }
                                          placeholder={accountConfig.fieldPlaceholders.account_number}
                                          required
                                        />
                              </div>
                            </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientIban">
                                        {accountConfig.fieldLabels.iban}
                                      </Label>
                                      <Input
                                        id="newRecipientIban"
                                        value={newRecipientData.iban}
                                        onChange={(e) =>
                                          setNewRecipientData({ ...newRecipientData, iban: e.target.value.toUpperCase() })
                                        }
                                        placeholder={accountConfig.fieldPlaceholders.iban}
                                      />
                          </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientSwiftBic">
                                        {accountConfig.fieldLabels.swift_bic} (Optional)
                                      </Label>
                                      <Input
                                        id="newRecipientSwiftBic"
                                        value={newRecipientData.swiftBic}
                                        onChange={(e) =>
                                          setNewRecipientData({
                                            ...newRecipientData,
                                            swiftBic: e.target.value.toUpperCase(),
                                          })
                                        }
                                        placeholder={accountConfig.fieldPlaceholders.swift_bic}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* EURO Account Fields */}
                                {accountConfig.accountType === "euro" && (
                                  <>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientIban">
                                        {accountConfig.fieldLabels.iban} *
                                      </Label>
                                      <Input
                                        id="newRecipientIban"
                                        value={newRecipientData.iban}
                                        onChange={(e) =>
                                          setNewRecipientData({ ...newRecipientData, iban: e.target.value.toUpperCase() })
                                        }
                                        placeholder={accountConfig.fieldPlaceholders.iban}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="newRecipientSwiftBic">
                                        {accountConfig.fieldLabels.swift_bic} (Optional)
                                      </Label>
                                      <Input
                                        id="newRecipientSwiftBic"
                                        value={newRecipientData.swiftBic}
                                        onChange={(e) =>
                                          setNewRecipientData({
                                            ...newRecipientData,
                                            swiftBic: e.target.value.toUpperCase(),
                                          })
                                        }
                                        placeholder={accountConfig.fieldPlaceholders.swift_bic}
                                      />
                                    </div>
                                  </>
                                )}

                                {/* Generic Account Fields */}
                                {accountConfig.accountType === "generic" && (
                                  <div className="space-y-2">
                                    <Label htmlFor="newRecipientAccount">
                                      {accountConfig.fieldLabels.account_number} *
                                    </Label>
                                    <Input
                                      id="newRecipientAccount"
                                      value={newRecipientData.accountNumber}
                                      onChange={(e) =>
                                        setNewRecipientData({ ...newRecipientData, accountNumber: e.target.value })
                                      }
                                      placeholder={accountConfig.fieldPlaceholders.account_number}
                                      required
                                    />
                                  </div>
                                )}
                              </>
                            )
                          })()}
                          <Button
                            onClick={handleAddNewRecipient}
                            disabled={(() => {
                              if (!newRecipientData.fullName || !receiveCurrency) return true

                              const accountConfig = getAccountTypeConfigFromCurrency(receiveCurrency)
                              const requiredFields = accountConfig.requiredFields

                              // Map snake_case field names from config to camelCase form field names
                              const mapFieldName = (fieldName: string): string => {
                                const fieldMap: Record<string, string> = {
                                  account_name: "fullName",
                                  routing_number: "routingNumber",
                                  account_number: "accountNumber",
                                  bank_name: "bankName",
                                  sort_code: "sortCode",
                                  iban: "iban",
                                  swift_bic: "swiftBic",
                                }
                                return fieldMap[fieldName] || fieldName
                              }

                              for (const field of requiredFields) {
                                const formFieldName = mapFieldName(field)
                                const fieldValue = newRecipientData[formFieldName as keyof typeof newRecipientData]
                                if (!fieldValue || (typeof fieldValue === "string" && !fieldValue.trim())) {
                                  return true
                                }
                              }

                              return false
                            })()}
                            className="w-full bg-easner-primary hover:bg-easner-primary-600"
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
                              ? "border-easner-primary bg-easner-primary-50"
                              : "border-gray-100 hover:border-easner-primary-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-easner-primary-100 rounded-full flex items-center justify-center relative">
                              <span className="text-easner-primary font-semibold text-sm">
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
                              <div className="text-sm text-gray-500 space-y-0.5">
                                {(() => {
                                  const accountConfig = getAccountTypeConfigFromCurrency(recipient.currency)
                                  const accountType = accountConfig.accountType

                                  return (
                                    <>
                                      {/* Show account number for US/UK/Generic, or IBAN for EURO */}
                                      {accountType === "euro" && recipient.iban ? (
                                        <p className="font-mono text-xs">
                                          {formatFieldValue(accountType, "iban", recipient.iban)}
                                        </p>
                                      ) : recipient.account_number ? (
                                        <p className="font-mono text-xs">
                                          {recipient.account_number}
                              </p>
                                      ) : null}
                                      <p>{recipient.bank_name}</p>
                                    </>
                                  )
                                })()}
                              </div>
                            </div>
                          </div>
                          {selectedRecipientId === recipient.id && (
                            <div className="w-6 h-6 bg-easner-primary rounded-full flex items-center justify-center">
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
                        className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
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
                    <CardTitle>Make Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method - Dynamic based on admin settings */}
                    <div className="bg-gradient-to-br from-easner-primary-50 to-blue-50 rounded-xl p-4 border border-easner-primary-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 border border-easner-primary rounded-lg flex items-center justify-center">
                          {sendCurrencyData && <FlagIcon currency={sendCurrencyData} />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-easner-primary">
                            Transfer {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {fee > 0
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
                              {defaultMethod?.type === "bank_account" && (() => {
                                const accountConfig = getAccountTypeConfigFromCurrency(sendCurrency)
                                const accountType = accountConfig.accountType

                                return (
                                <div className="bg-white rounded-lg p-3 border border-gray-100">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Building2 className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="space-y-2">
                                      {/* Account Name - Always shown */}
                                      <div className="space-y-1">
                                        <span className="text-gray-600 text-xs">
                                          {accountConfig.fieldLabels.account_name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{defaultMethod.account_name}</span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                            onClick={() => handleCopy(defaultMethod.account_name || "", "accountName")}
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

                                      {/* US Account Fields */}
                                      {accountType === "us" && defaultMethod.routing_number && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountConfig.fieldLabels.routing_number}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-sm">
                                              {formatFieldValue(accountType, "routing_number", defaultMethod.routing_number)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleCopy(defaultMethod.routing_number || "", "routingNumber")}
                                              className="h-5 w-5 p-0"
                                            >
                                              {copiedStates.routingNumber ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* UK Account Fields */}
                                      {accountType === "uk" && defaultMethod.sort_code && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountConfig.fieldLabels.sort_code}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-sm">
                                              {formatFieldValue(accountType, "sort_code", defaultMethod.sort_code)}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleCopy(defaultMethod.sort_code || "", "sortCode")}
                                              className="h-5 w-5 p-0"
                                            >
                                              {copiedStates.sortCode ? (
                                                <Check className="h-3 w-3 text-green-600" />
                                              ) : (
                                                <Copy className="h-3 w-3" />
                                              )}
                                            </Button>
                                          </div>
                                        </div>
                                      )}

                                      {/* Account Number - Shown for US, UK, and Generic */}
                                      {(accountType === "us" || accountType === "uk" || accountType === "generic") &&
                                        defaultMethod.account_number && (
                                          <div className="space-y-1">
                                            <span className="text-gray-600 text-xs">
                                              {accountConfig.fieldLabels.account_number}
                                            </span>
                                            <div className="flex items-center gap-2">
                                        <span className="font-medium font-mono text-sm">
                                          {defaultMethod.account_number}
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                                onClick={() => handleCopy(defaultMethod.account_number || "", "accountNumber")}
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
                                        )}

                                      {/* IBAN - Shown for UK and EURO */}
                                      {(accountType === "uk" || accountType === "euro") && defaultMethod.iban && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountConfig.fieldLabels.iban}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-xs">
                                              {formatFieldValue(accountType, "iban", defaultMethod.iban)}
                                            </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                              onClick={() => handleCopy(defaultMethod.iban || "", "iban")}
                                          className="h-5 w-5 p-0"
                                        >
                                              {copiedStates.iban ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                      )}

                                      {/* SWIFT/BIC - Shown for UK and EURO if present */}
                                      {(accountType === "uk" || accountType === "euro") && defaultMethod.swift_bic && (
                                        <div className="space-y-1">
                                          <span className="text-gray-600 text-xs">
                                            {accountConfig.fieldLabels.swift_bic}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium font-mono text-xs">
                                              {defaultMethod.swift_bic}
                                            </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                              onClick={() => handleCopy(defaultMethod.swift_bic || "", "swiftBic")}
                                          className="h-5 w-5 p-0"
                                        >
                                              {copiedStates.swiftBic ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                      )}

                                      {/* Bank Name - Always shown */}
                                      <div className="space-y-1">
                                        <span className="text-gray-600 text-xs">
                                          {accountConfig.fieldLabels.bank_name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">{defaultMethod.bank_name}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCopy(defaultMethod.bank_name || "", "bankName")}
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
                                    </div>
                                  </div>
                                )
                              })()}

                              {defaultMethod?.type === "qr_code" && (
                                <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                                  <div className="flex items-center justify-center gap-2 mb-3">
                                    <QrCode className="h-4 w-4 text-gray-600" />
                                    <span className="font-medium text-sm">{defaultMethod.name}</span>
                                  </div>
                                  <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                                    {defaultMethod.qr_code_data ? (
                                      defaultMethod.qr_code_data.endsWith(".svg") ? (
                                        <img
                                          src={defaultMethod.qr_code_data || "/placeholder.svg"}
                                          alt="QR Code"
                                          className="w-full h-full object-contain"
                                        />
                                      ) : defaultMethod.qr_code_data.endsWith(".pdf") ? (
                                        <div className="text-center">
                                          <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                                          <a
                                            href={defaultMethod.qr_code_data}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                                          >
                                            View QR Code PDF
                                          </a>
                                        </div>
                                      ) : (
                                        <img
                                          src={defaultMethod.qr_code_data || "/placeholder.svg"}
                                          alt="QR Code"
                                          className="w-full h-full object-contain"
                                        />
                                      )
                                    ) : (
                                      <QrCode className="h-16 w-16 text-gray-400" />
                                    )}
                                  </div>
                                  {defaultMethod.instructions && (
                                    <p className="text-xs text-gray-500 mb-2">{defaultMethod.instructions}</p>
                                  )}
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
                                        {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                                      </strong>
                                      {fee > 0 && (
                                        <span className="text-xs block text-amber-600">
                                          (Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} +
                                          Fee: {formatCurrency(fee, sendCurrency)})
                                        </span>
                                      )}
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span className="flex-1">
                                      Note Transaction ID{" "}
                                      <span className="inline-flex items-center gap-1">
                                        <strong>{transactionId}</strong>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleCopy(transactionId, "transactionIdInstructions")}
                                          className="h-4 w-4 p-0 hover:bg-amber-100"
                                        >
                                          {copiedStates.transactionIdInstructions ? (
                                            <Check className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Copy className="h-3 w-3 text-amber-700" />
                                          )}
                                        </Button>
                                      </span>
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>
                                      Complete within <strong>a few minutes</strong>
                                    </span>
                                  </li>
                                  <li className="flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                    <span>Upload receipt for quick verification</span>
                                  </li>
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
                            ? "border-easner-primary bg-easner-primary-50"
                            : uploadedFile
                              ? "border-green-300 bg-green-50"
                              : uploadError
                                ? "border-red-300 bg-red-50"
                                : "border-gray-200 hover:border-easner-primary-300"
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
                                    ? "bg-easner-primary-100"
                                    : "bg-gray-100 group-hover:bg-easner-primary-50"
                            }`}
                          >
                            {uploadedFile ? (
                              <Check className="h-5 w-5 text-green-600" />
                            ) : uploadError ? (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            ) : (
                              <Upload
                                className={`h-5 w-5 transition-colors ${
                                  isDragOver ? "text-easner-primary" : "text-gray-400"
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
                                className="bg-easner-primary h-1.5 rounded-full transition-all duration-300"
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
                          className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                        >
                          {isCreatingTransaction ? "Sending..." : "I've Paid"}
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

      {/* Email Verification Modal */}
      <Dialog open={showEmailVerificationModal} onOpenChange={setShowEmailVerificationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Email Verification Required
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Please verify your email address before you can send money. We've sent a verification link to <strong>{user?.email}</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Check your email and click the verification link to continue.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowEmailVerificationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleResendVerificationEmail}
                disabled={isResendingVerification}
                className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
              >
                {isResendingVerification ? "Sending..." : "Resend Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </UserDashboardLayout>
  )
}
