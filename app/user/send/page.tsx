"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, Upload, Check, Clock, ArrowLeft, Copy, ChevronRight, Plus, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// Import the new calculateFee function
import { convertCurrency, formatCurrency, getExchangeRate, calculateFee, currencies } from "@/utils/currency"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Mock saved recipients
const savedRecipients = [
  { id: "1", name: "John Doe", accountNumber: "1234567890", bankName: "First Bank", currency: "NGN" },
  { id: "2", name: "Jane Smith", accountNumber: "0987654321", bankName: "Sberbank", currency: "RUB" },
]

export default function UserSendPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("RUB")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("NGN")
  const [receiveAmount, setReceiveAmount] = useState<number>(0)
  const [recipientData, setRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })
  const [saveRecipient, setSaveRecipient] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [transactionId] = useState(`NP${Date.now()}`)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>("")
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    phoneNumber: "",
  })

  // Copy feedback states
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({})

  // File upload states
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add fee state
  const [fee, setFee] = useState<number>(0)
  const [feeType, setFeeType] = useState<string>("free")

  const filteredSavedRecipients = savedRecipients.filter(
    (recipient) =>
      (recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipient.accountNumber.includes(searchTerm)) &&
      recipient.currency === receiveCurrency,
  )

  const handleSelectRecipient = (recipient: any) => {
    setSelectedRecipientId(recipient.id)
    setRecipientData({
      fullName: recipient.name,
      accountNumber: recipient.accountNumber,
      bankName: recipient.bankName,
      phoneNumber: "",
    })
  }

  const handleAddNewRecipient = () => {
    const newRecipient = {
      id: Date.now().toString(),
      name: newRecipientData.fullName,
      accountNumber: newRecipientData.accountNumber,
      bankName: newRecipientData.bankName,
      currency: receiveCurrency,
    }

    // Add to saved recipients (in real app, this would be an API call)
    savedRecipients.push(newRecipient)

    // Select the new recipient
    handleSelectRecipient(newRecipient)

    // Clear form and close dialog
    setNewRecipientData({
      fullName: "",
      accountNumber: "",
      bankName: "",
      phoneNumber: "",
    })
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
  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, and PDF files are allowed")
      return
    }

    setUploadedFile(file)
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
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

  // Update the useEffect to calculate fee
  useEffect(() => {
    const amount = Number.parseFloat(sendAmount) || 0
    const converted = convertCurrency(amount, sendCurrency, receiveCurrency)
    const feeData = calculateFee(amount, sendCurrency, receiveCurrency)
    const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)

    setReceiveAmount(converted)
    setFee(feeData.fee)
    setFeeType(feeData.feeType)
  }, [sendAmount, sendCurrency, receiveCurrency])

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

  const handleContinue = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else if (currentStep === 3) {
      // Redirect to transaction status page
      router.push(`/user/send/${transactionId.toLowerCase()}`)
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
        {currentStep >= 3 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-mono text-sm">{transactionId}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )

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
                                  <div dangerouslySetInnerHTML={{ __html: sendCurrencyData?.flag || "" }} />
                                  <span className="font-medium text-sm">{sendCurrency}</span>
                                  <ChevronDown className="h-3 w-3 text-gray-500" />
                                </div>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              {currencies.map((currency) => (
                                <DropdownMenuItem
                                  key={currency.code}
                                  onClick={() => setSendCurrency(currency.code)}
                                  className="flex items-center gap-3"
                                >
                                  <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
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
                                    <div dangerouslySetInnerHTML={{ __html: receiveCurrencyData?.flag || "" }} />
                                    <span className="font-medium text-sm">{receiveCurrency}</span>
                                    <ChevronDown className="h-3 w-3 text-gray-500" />
                                  </div>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                {currencies.map((currency) => (
                                  <DropdownMenuItem
                                    key={currency.code}
                                    onClick={() => setReceiveCurrency(currency.code)}
                                    className="flex items-center gap-3"
                                  >
                                    <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
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

                    <Button onClick={handleContinue} className="w-full bg-novapay-primary hover:bg-novapay-primary-600">
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
                            <Label htmlFor="newRecipientPhone">Phone Number (Optional)</Label>
                            <Input
                              id="newRecipientPhone"
                              value={newRecipientData.phoneNumber}
                              onChange={(e) =>
                                setNewRecipientData({ ...newRecipientData, phoneNumber: e.target.value })
                              }
                              placeholder="Enter phone number"
                            />
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
                                {recipient.name
                                  .split(" ")
                                  .map((n) => n[0])
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
                              <p className="font-medium text-gray-900">{recipient.name}</p>
                              <p className="text-sm text-gray-500">
                                {recipient.bankName} - {recipient.accountNumber}
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
                    {/* Payment Method - Dynamic based on sending currency and admin settings */}
                    <div className="bg-gradient-to-br from-novapay-primary-50 to-blue-50 rounded-xl p-4 border border-novapay-primary-100">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-novapay-primary rounded-lg flex items-center justify-center">
                          <div dangerouslySetInnerHTML={{ __html: sendCurrencyData?.flag || "" }} className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-novapay-primary">
                            Transfer {formatCurrency((Number.parseFloat(sendAmount) || 0) + fee, sendCurrency)}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {fee > 0
                              ? `Send amount: ${formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee: ${formatCurrency(fee, sendCurrency)}`
                              : "Send money to complete your transfer"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Payment Method - Either Bank Transfer OR QR Code (admin configurable) */}
                        <div className="space-y-3">
                          {/* Bank Transfer Option (shown if admin configured for this currency) */}
                          <div className="bg-white rounded-lg p-3 border border-gray-100">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-xs">Account Name</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium text-sm">
                                    {sendCurrency === "RUB" ? "Novapay Russia LLC" : "Novapay Nigeria Ltd"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCopy(
                                        sendCurrency === "RUB" ? "Novapay Russia LLC" : "Novapay Nigeria Ltd",
                                        "accountName",
                                      )
                                    }
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
                                    {sendCurrency === "RUB" ? "40817810123456789012" : "1234567890"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCopy(
                                        sendCurrency === "RUB" ? "40817810123456789012" : "1234567890",
                                        "accountNumber",
                                      )
                                    }
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
                                  <span className="font-medium text-sm">
                                    {sendCurrency === "RUB" ? "Sberbank Russia" : "First Bank Nigeria"}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleCopy(
                                        sendCurrency === "RUB" ? "Sberbank Russia" : "First Bank Nigeria",
                                        "bankName",
                                      )
                                    }
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
                                <span className="text-gray-600 text-xs">Reference</span>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium font-mono text-xs">{transactionId}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(transactionId, "reference")}
                                    className="h-5 w-5 p-0"
                                  >
                                    {copiedStates.reference ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* QR Code Option (alternative - shown if admin configured for this currency)
                          <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">QR Code</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">Scan to transfer</p>
                            <div className="text-xs text-gray-600">
                              <p className="font-mono">{transactionId}</p>
                              <p>{formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)}</p>
                            </div>
                          </div>
                          */}
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
                                      (Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)} + Fee:{" "}
                                      {formatCurrency(fee, sendCurrency)})
                                    </span>
                                  )}
                                </span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5 text-xs">•</span>
                                <span>
                                  Include reference <strong>{transactionId}</strong>
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
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compact Upload Receipt Section */}
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />
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
                              : "border-gray-200 hover:border-novapay-primary-300"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              uploadedFile
                                ? "bg-green-100"
                                : isDragOver
                                  ? "bg-novapay-primary-100"
                                  : "bg-gray-100 group-hover:bg-novapay-primary-50"
                            }`}
                          >
                            {uploadedFile ? (
                              <Check className="h-5 w-5 text-green-600" />
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
                              {uploadedFile ? uploadedFile.name : "Upload Payment Receipt"}
                            </h3>
                            <p className="text-xs text-gray-500">
                              {uploadedFile
                                ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                                : "JPG, PNG or PDF (Max 5MB)"}
                            </p>
                          </div>
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
                          className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                        >
                          I've Completed Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Processing Status */}
              {/*{currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Processing Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-yellow-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Transaction Processing</h3>
                      <p className="text-gray-600">Your transfer is being processed</p>
                    </div>

                    {/* Progress Steps *}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-green-600 font-medium">Payment Received</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white animate-spin" />
                        </div>
                        <span className="text-yellow-600 font-medium">Verification in Progress</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">3</span>
                        </div>
                        <span className="text-gray-500">Transfer Initiated</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">4</span>
                        </div>
                        <span className="text-gray-500">Transfer Complete</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Estimated completion:</span>
                        <span className="font-medium">15-30 minutes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Transaction Reference:</span>
                        <span className="font-mono text-sm">{transactionId}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
                        Send Another Transfer
                      </Button>
                      <Button
                        onClick={() => router.push("/user/dashboard")}
                        className="flex-1 bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}*/}
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
