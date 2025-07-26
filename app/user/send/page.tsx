"use client"

import { useState, useEffect } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ChevronDown, Upload, Check, Clock, ArrowLeft, Copy } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { convertCurrency, formatCurrency, getExchangeRate, currencies } from "@/utils/currency"
import { useRouter } from "next/navigation"

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
  const [selectedRecipient, setSelectedRecipient] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState(3600) // 60 minutes in seconds
  const [transactionId] = useState(`NP${Date.now()}`)

  useEffect(() => {
    const amount = Number.parseFloat(sendAmount) || 0
    const converted = convertCurrency(amount, sendCurrency, receiveCurrency)
    setReceiveAmount(converted)
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

  const handleRecipientSelect = (recipientId: string) => {
    const recipient = savedRecipients.find((r) => r.id === recipientId)
    if (recipient) {
      setRecipientData({
        fullName: recipient.name,
        accountNumber: recipient.accountNumber,
        bankName: recipient.bankName,
        phoneNumber: "",
      })
      setSelectedRecipient(recipientId)
    }
  }

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const exchangeRate = getExchangeRate(sendCurrency, receiveCurrency)
  const sendCurrencyData = currencies.find((c) => c.code === sendCurrency)
  const receiveCurrencyData = currencies.find((c) => c.code === receiveCurrency)

  const steps = [
    { number: 1, title: "Amount & Currency", completed: currentStep > 1 },
    { number: 2, title: "Recipient Details", completed: currentStep > 2 },
    { number: 3, title: "Payment Instructions", completed: currentStep > 3 },
    { number: 4, title: "Processing Status", completed: false },
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
            <span className="text-gray-600">Recipient Gets</span>
            <span className="font-semibold">{formatCurrency(receiveAmount, receiveCurrency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange Rate</span>
            <span className="text-sm">
              1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fee</span>
            <span className="text-green-600 font-medium">FREE</span>
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
              {/* Step 1: Amount & Currency */}
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Amount & Currency</CardTitle>
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
                        <span className="font-medium text-green-600">FREE</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-novapay-primary text-xs">%</span>
                          </div>
                          <span className="text-sm text-gray-600">Rate</span>
                        </div>
                        <span className="font-medium text-novapay-primary">
                          1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
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

              {/* Step 2: Recipient Details */}
              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recipient Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Saved Recipients Dropdown */}
                    {savedRecipients.length > 0 && (
                      <div className="space-y-2">
                        <Label>Select Saved Recipient (Optional)</Label>
                        <Select value={selectedRecipient} onValueChange={handleRecipientSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose from saved recipients" />
                          </SelectTrigger>
                          <SelectContent>
                            {savedRecipients.map((recipient) => (
                              <SelectItem key={recipient.id} value={recipient.id}>
                                {recipient.name} - {recipient.bankName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Recipient Form */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={recipientData.fullName}
                          onChange={(e) => setRecipientData({ ...recipientData, fullName: e.target.value })}
                          placeholder="Enter recipient's full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number *</Label>
                        <Input
                          id="accountNumber"
                          value={recipientData.accountNumber}
                          onChange={(e) => setRecipientData({ ...recipientData, accountNumber: e.target.value })}
                          placeholder="Enter account number"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name *</Label>
                        <Input
                          id="bankName"
                          value={recipientData.bankName}
                          onChange={(e) => setRecipientData({ ...recipientData, bankName: e.target.value })}
                          placeholder="Enter bank name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                        <Input
                          id="phoneNumber"
                          value={recipientData.phoneNumber}
                          onChange={(e) => setRecipientData({ ...recipientData, phoneNumber: e.target.value })}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="saveRecipient"
                          checked={saveRecipient}
                          onCheckedChange={(checked) => setSaveRecipient(checked as boolean)}
                        />
                        <Label htmlFor="saveRecipient" className="text-sm">
                          Save this recipient for future transfers
                        </Label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={!recipientData.fullName || !recipientData.accountNumber || !recipientData.bankName}
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
                      Payment Instructions
                      <div className="flex items-center text-orange-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Payment Method - Bank Transfer */}
                    <div className="bg-novapay-primary-50 rounded-lg p-6 space-y-4">
                      <h3 className="font-semibold text-novapay-primary">Transfer money to this account:</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Account Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Novapay Limited</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("Novapay Limited")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Account Number:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">1234567890</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("1234567890")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Bank Name:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Sberbank Russia</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText("Sberbank Russia")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Reference:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium font-mono">{transactionId}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(transactionId)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Alternative: QR Code Payment (commented out - admin configurable)
                    <div className="text-center">
                      <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <span className="text-gray-500">QR Code</span>
                      </div>
                      <p className="text-sm text-gray-600">Scan to transfer money</p>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Reference: <span className="font-mono">{transactionId}</span></p>
                        <p className="text-sm text-gray-600">Amount: {formatCurrency(Number.parseFloat(sendAmount) || 0, sendCurrency)}</p>
                      </div>
                    </div>
                    */}

                    {/* Upload Receipt */}
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full bg-transparent">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Receipt
                      </Button>
                      <Button
                        onClick={handleContinue}
                        className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                      >
                        I've Completed Payment
                      </Button>
                    </div>

                    {/* Warnings */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Important Instructions:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Transfer the exact amount shown above</li>
                        <li>• Include the reference number in your transfer</li>
                        <li>• Complete payment within 60 minutes</li>
                        <li>• Upload your receipt for faster processing</li>
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 4: Processing Status */}
              {currentStep === 4 && (
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

                    {/* Progress Steps */}
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
