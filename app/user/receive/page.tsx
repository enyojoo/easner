"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import dynamic from "next/dynamic"
import { 
  Download, 
  Plus, 
  Copy, 
  Check, 
  Wallet, 
  ArrowRight, 
  QrCode,
  ChevronRight,
  ChevronDown,
  Search,
  Building2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useUserData } from "@/hooks/use-user-data"
import { recipientService } from "@/lib/database"
import { getAccountTypeConfigFromCurrency, formatFieldValue } from "@/lib/currency-account-types"
import type { Currency } from "@/types"

// Dynamically import QRCode to avoid SSR issues
const QRCodeSVG = dynamic(
  async () => {
    const qrcode = await import("qrcode.react")
    return { default: qrcode.QRCodeSVG }
  },
  { ssr: false }
)

// Currency Dropdown Component (matching send page)
const CurrencyDropdown = ({
  selectedCurrency,
  onCurrencyChange,
  searchTerm,
  onSearchChange,
  isOpen,
  onToggle,
  dropdownRef,
  currencies,
}: {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
  searchTerm: string
  onSearchChange: (search: string) => void
  isOpen: boolean
  onToggle: () => void
  dropdownRef: React.RefObject<HTMLDivElement>
  currencies: Currency[]
}) => {
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down')

  const filteredCurrencies = useMemo(() => {
    if (!searchTerm) return currencies
    return currencies.filter(
      (currency) =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        currency.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [searchTerm, currencies])

  const selectedCurrencyData = useMemo(() => 
    currencies.find((c) => c.code === selectedCurrency), 
    [currencies, selectedCurrency]
  )

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = 200
      const spaceBelow = viewportHeight - rect.bottom
      const spaceAbove = rect.top

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
          <div className={`absolute right-4 w-0 h-0 ${
            dropdownPosition === 'up'
              ? 'top-full border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-200'
              : 'bottom-full border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-200'
          }`}></div>
          
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

  if (currency.flag.startsWith("<svg")) {
    return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
  }

  if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
    return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={24} height={24} />
  }

  return <span className="text-xs">{currency.code}</span>
}

interface CryptoWallet {
  id: string
  crypto_currency: string
  wallet_address: string
  blockchain_address?: string
  blockchain_memo?: string
  stellar_account_id?: string
  fiat_currency: string
  status: string
  transaction_count: number
  destination_type?: "bank"
  recipient?: {
    full_name: string
    account_number: string
    bank_name: string
    currency: string
  }
}


export default function ReceiveMoneyPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const { recipients: cachedRecipients, currencies: cachedCurrencies, refreshRecipients } = useUserData()
  // Initialize from cache synchronously to prevent reload flicker
  const getInitialWallets = (): CryptoWallet[] | null => {
    if (!userProfile?.id) return null
    try {
      const cached = localStorage.getItem(`easner_crypto_wallets_${userProfile.id}`)
      if (!cached) return null
      const { value, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return value
      }
      return null
    } catch {
      return null
    }
  }

  const [wallets, setWallets] = useState<CryptoWallet[]>(() => getInitialWallets() || [])
  const [loading, setLoading] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [showCreateFlow, setShowCreateFlow] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [selectedFiat, setSelectedFiat] = useState("")
  const [selectedRecipient, setSelectedRecipient] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddRecipientDialogOpen, setIsAddRecipientDialogOpen] = useState(false)
  
  // Currency dropdown states
  const [fiatCurrencySearch, setFiatCurrencySearch] = useState<string>("")
  const [fiatDropdownOpen, setFiatDropdownOpen] = useState<boolean>(false)
  const fiatDropdownRef = useRef<HTMLDivElement>(null)
  const currencyListRef = useRef<HTMLDivElement>(null)
  const selectedCurrencyRef = useRef<HTMLDivElement>(null)

  // New recipient form data
  const [newRecipientData, setNewRecipientData] = useState({
    fullName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    sortCode: "",
    iban: "",
    swiftBic: "",
  })
  
  const recipients = cachedRecipients || []
  const currencies = cachedCurrencies || []

  // Fetch wallets and supported cryptos - only if not in cache
  useEffect(() => {
    // Don't fetch if user not loaded
    if (!userProfile?.id) return

    const CACHE_KEY_WALLETS = `easner_crypto_wallets_${userProfile.id}`
    const CACHE_TTL = 5 * 60 * 1000

    const getCachedWallets = (): CryptoWallet[] | null => {
      try {
        const cached = localStorage.getItem(CACHE_KEY_WALLETS)
        if (!cached) return null
        const { value, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_TTL) {
          return value
        }
        localStorage.removeItem(CACHE_KEY_WALLETS)
        return null
      } catch {
        return null
      }
    }

    const setCachedWallets = (value: CryptoWallet[]) => {
      try {
        localStorage.setItem(CACHE_KEY_WALLETS, JSON.stringify({
          value,
          timestamp: Date.now()
        }))
      } catch {}
    }

    // Data is already loaded from cache in initial state
    // Only fetch if cache is missing or expired
    const cachedWallets = getCachedWallets()

    // Update state if cache exists and state is empty (only on first mount)
    if (cachedWallets !== null && wallets.length === 0) {
      setWallets(cachedWallets)
    }

    // If cached and valid, no need to fetch
    if (cachedWallets !== null) {
      return
    }

    // Only fetch missing or expired data
    const fetchData = async () => {
      // Only show loading if we don't have cached data
      if (cachedWallets === null) {
        setLoading(true)
      }
      try {
        const walletsData = await fetch("/api/crypto/wallets").then(res => res.ok ? res.json() : null)

        if (walletsData) {
          const walletsList = walletsData.wallets || []
          setWallets(walletsList)
          setCachedWallets(walletsList)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userProfile?.id]) // Only fetch when user changes

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fiatDropdownRef.current && !fiatDropdownRef.current.contains(event.target as Node)) {
        setFiatDropdownOpen(false)
        setFiatCurrencySearch("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Scroll selected currency into view when it changes
  useEffect(() => {
    if (selectedFiat && selectedCurrencyRef.current && currencyListRef.current) {
      setTimeout(() => {
        selectedCurrencyRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }, 100)
    }
  }, [selectedFiat])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAddress(text)
      setTimeout(() => setCopiedAddress(null), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleCreateWallet = async () => {
    if (!selectedCrypto || !selectedFiat || !selectedRecipient) {
      alert("Please select a recipient for bank payout")
      return
    }

    try {
      const requestBody: any = {
        cryptoCurrency: selectedCrypto,
        fiatCurrency: selectedFiat,
        destinationType: "bank", // Receive flow only supports bank payouts
        chain: "stellar", // Default to stellar, can be made configurable later
        recipientId: selectedRecipient,
      }

      const response = await fetch("/api/crypto/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (response.ok) {
        const data = await response.json()
        // Update cache
        const CACHE_KEY_WALLETS = `easner_crypto_wallets_${userProfile?.id}`
        try {
          const cached = localStorage.getItem(CACHE_KEY_WALLETS)
          if (cached) {
            const { value } = JSON.parse(cached)
            localStorage.setItem(CACHE_KEY_WALLETS, JSON.stringify({
              value: [data.wallet, ...value],
              timestamp: Date.now()
            }))
          }
        } catch {}
        
        setWallets([data.wallet, ...wallets])
        setShowCreateFlow(false)
        setCreateStep(1)
        setSelectedCrypto("")
        setSelectedFiat("")
        setSelectedRecipient("")
      } else {
        const error = await response.json()
        alert(error.error || "Failed to create address")
      }
    } catch (error) {
      console.error("Error creating address:", error)
      alert("Failed to create address")
    }
  }

  const handleAddNewRecipient = async () => {
    if (!userProfile?.id) return

    try {
      const newRecipient = await recipientService.create(userProfile.id, {
        fullName: newRecipientData.fullName,
        accountNumber: newRecipientData.accountNumber,
        bankName: newRecipientData.bankName,
        currency: selectedFiat,
        routingNumber: newRecipientData.routingNumber || undefined,
        sortCode: newRecipientData.sortCode || undefined,
        iban: newRecipientData.iban || undefined,
        swiftBic: newRecipientData.swiftBic || undefined,
      })

      await refreshRecipients()
      setSelectedRecipient(newRecipient.id)
      setNewRecipientData({
        fullName: "",
        accountNumber: "",
        bankName: "",
        routingNumber: "",
        sortCode: "",
        iban: "",
        swiftBic: "",
      })
      setIsAddRecipientDialogOpen(false)
    } catch (error) {
      console.error("Error adding recipient:", error)
      alert("Failed to add recipient. Please try again.")
    }
  }

  const filteredRecipients = useMemo(() => {
    if (!selectedFiat) return []
    return recipients.filter(
      (recipient) =>
        (recipient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipient.account_number.includes(searchTerm)) &&
        recipient.currency === selectedFiat,
    )
  }, [recipients, selectedFiat, searchTerm])

  const selectedFiatCurrencyData = useMemo(() => 
    currencies.find((c) => c.code === selectedFiat), 
    [currencies, selectedFiat]
  )

  // Show loading only if we have no cached data
  if (wallets.length === 0 && !loading) {
    return (
      <UserDashboardLayout>
        <div className="p-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  if (loading && wallets.length === 0) {
    return (
      <UserDashboardLayout>
        <div className="p-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="space-y-5 sm:space-y-6 pb-5 sm:pb-6">
        {/* Page Header */}
        <div className="bg-white p-5 sm:p-6 mb-5 sm:mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Receive Money</h1>
          <p className="text-base text-gray-600">Receive stablecoins directly to your local currency bank account.</p>
        </div>

        {/* Existing Wallets Section */}
        {wallets.length > 0 && (
          <div className="px-5 sm:px-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Your Addresses</h2>
              {!showCreateFlow && (
                <Button 
                  onClick={() => setShowCreateFlow(true)}
                  className="bg-easner-primary hover:bg-easner-primary-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              )}
            </div>

            {wallets.map((wallet) => (
              <Card key={wallet.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-easner-primary/10 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-easner-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{wallet.crypto_currency}</h3>
                        <p className="text-sm text-gray-600">Stablecoin Address</p>
                      </div>
                    </div>
                    <Badge className={wallet.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                      {wallet.status}
                    </Badge>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(wallet.blockchain_address || wallet.wallet_address)}
                          className="h-7"
                        >
                          {copiedAddress === (wallet.blockchain_address || wallet.wallet_address) ? (
                            <>
                              <Check className="h-3 w-3 text-green-600 mr-1" />
                              <span className="text-xs text-green-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              <span className="text-xs">Copy</span>
                            </>
                          )}
                        </Button>
                      </div>
                      <code className="text-sm font-mono text-gray-900 break-all block">
                        {wallet.blockchain_address || wallet.wallet_address}
                      </code>
                    </div>
                    {wallet.blockchain_memo && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Memo (Required for Stellar)</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(wallet.blockchain_memo || "")}
                            className="h-7"
                          >
                            {copiedAddress === wallet.blockchain_memo ? (
                              <>
                                <Check className="h-3 w-3 text-green-600 mr-1" />
                                <span className="text-xs text-green-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </Button>
                        </div>
                        <code className="text-sm font-mono text-gray-900 block">
                          {wallet.blockchain_memo}
                        </code>
                        <p className="text-xs text-amber-600 mt-2">
                          ⚠️ Include this memo when sending to this address on Stellar
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Linked Account</p>
                      <p className="font-semibold text-gray-900">{wallet.recipient?.full_name || "Bank Account"}</p>
                      <p className="text-sm text-gray-600">{wallet.recipient?.bank_name || ""}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Currency</p>
                      <p className="font-semibold text-gray-900">{wallet.fiat_currency}</p>
                      <p className="text-sm text-gray-600">{wallet.transaction_count || 0} transactions</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Scan to Receive</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4 py-4">
                          <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                            <QRCodeSVG value={wallet.blockchain_address || wallet.wallet_address} size={240} />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-gray-900">Send {wallet.crypto_currency} to this address</p>
                            <code className="text-xs font-mono bg-gray-100 px-3 py-2 rounded block break-all">
                              {wallet.blockchain_address || wallet.wallet_address}
                            </code>
                            {wallet.blockchain_memo && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs font-medium text-gray-700 mb-1">Memo (Required):</p>
                                <code className="text-xs font-mono bg-amber-50 text-amber-900 px-3 py-2 rounded block">
                                  {wallet.blockchain_memo}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="default"
                      className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                      onClick={() => router.push(`/user/receive/${wallet.id}`)}
                    >
                      View History
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Flow */}
        {showCreateFlow && (
          <div className="px-5 sm:px-6">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Create New Address</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowCreateFlow(false)
                    setCreateStep(1)
                    setSelectedCrypto("")
                    setSelectedFiat("")
                    setSelectedRecipient("")
                  }}>
                    ✕
                  </Button>
                </div>
                {/* Progress Steps */}
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex-1 flex items-center">
                      <div className={`flex-1 h-1 rounded-full ${
                        createStep >= step ? 'bg-easner-primary' : 'bg-gray-200'
                      }`} />
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ml-2 ${
                        createStep > step ? 'bg-easner-primary text-white' :
                        createStep === step ? 'bg-easner-primary text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {createStep > step ? <CheckCircle2 className="h-4 w-4" /> : step}
                      </div>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8 flex flex-col h-[calc(100vh-450px)] min-h-[400px] max-h-[500px]">
                {createStep === 1 && (
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto">
                      <div className="space-y-6">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 block">
                            Choose Stablecoin
                          </label>
                          <div className="text-center py-8 text-gray-500">
                            <p>Cryptocurrency selection is not available</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-6 mt-6 flex-shrink-0">
                      <Button variant="outline" onClick={() => setShowCreateFlow(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button
                        onClick={() => setCreateStep(2)}
                        disabled={!selectedCrypto}
                        className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {createStep === 2 && (
                  <div className="flex flex-col h-full">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Select Fiat Currency
                      </label>
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                          placeholder="Search currencies"
                          value={fiatCurrencySearch}
                          onChange={(e) => setFiatCurrencySearch(e.target.value)}
                          className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Scrollable Currency List - Shows exactly 2 currencies */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div ref={currencyListRef} className="overflow-y-auto flex-1" style={{ minHeight: '200px' }}>
                        <div className="space-y-3 pr-2 pb-2">
                          {(() => {
                            const filteredCurrencies = currencies.filter((currency) => {
                              if (fiatCurrencySearch) {
                                return (
                                  currency.code.toLowerCase().includes(fiatCurrencySearch.toLowerCase()) ||
                                  currency.name.toLowerCase().includes(fiatCurrencySearch.toLowerCase())
                                )
                              }
                              return true
                            })

                            // Sort to prioritize selected currency - move it to the top
                            const sortedCurrencies = [...filteredCurrencies].sort((a, b) => {
                              if (selectedFiat === a.code) return -1
                              if (selectedFiat === b.code) return 1
                              return 0
                            })

                            if (sortedCurrencies.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  <p>No currencies found matching "{fiatCurrencySearch}"</p>
                                </div>
                              )
                            }

                            return sortedCurrencies.map((currency, index) => (
                              <div
                                key={currency.code}
                                ref={selectedFiat === currency.code ? selectedCurrencyRef : null}
                                onClick={() => {
                                  setSelectedFiat(currency.code)
                                  setFiatCurrencySearch("")
                                }}
                                className={`flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer transition-colors ${
                                  selectedFiat === currency.code
                                    ? "border-easner-primary bg-easner-primary-50 shadow-sm"
                                    : "border-gray-100 hover:border-easner-primary-200"
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <FlagIcon currency={currency} />
                                  <div>
                                    <p className={`font-medium ${selectedFiat === currency.code ? 'text-easner-primary' : 'text-gray-900'}`}>
                                      {currency.code}
                                    </p>
                                    <p className="text-sm text-gray-500">{currency.name}</p>
                                  </div>
                                </div>
                                {selectedFiat === currency.code && (
                                  <div className="w-6 h-6 bg-easner-primary rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Fixed Footer Buttons */}
                    <div className="flex gap-3 pt-6 mt-6 flex-shrink-0">
                      <Button variant="outline" onClick={() => setCreateStep(1)} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={() => setCreateStep(3)}
                        disabled={!selectedFiat}
                        className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                      >
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {createStep === 3 && (
                  <div className="flex flex-col h-full">
                    {/* Fixed Header */}
                    <div className="flex-shrink-0 mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Link Bank Account
                      </label>
                      
                      {/* Two Column Layout: Search (longer) and Add Button (smaller) */}
                      <div className="flex gap-3">
                        {/* Search Bar - Longer Column */}
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder="Search recipients"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12 bg-gray-50 border-0 rounded-xl"
                          />
                        </div>

                        {/* Add New Recipient Button - Smaller Column */}
                        <Dialog open={isAddRecipientDialogOpen} onOpenChange={setIsAddRecipientDialogOpen}>
                          <DialogTrigger asChild>
                            <button className="flex items-center justify-center gap-2 px-4 h-12 bg-white rounded-xl border border-gray-100 hover:border-easner-primary-200 cursor-pointer transition-colors flex-shrink-0">
                              <Plus className="h-5 w-5 text-easner-primary" />
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">Add</span>
                            </button>
                          </DialogTrigger>

                          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add New Recipient</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="newRecipientCurrency">Currency</Label>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                  {selectedFiatCurrencyData && <FlagIcon currency={selectedFiatCurrencyData} />}
                                  <div>
                                    <div className="font-medium">{selectedFiat}</div>
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
                                const accountConfig = selectedFiat
                                  ? getAccountTypeConfigFromCurrency(selectedFiat)
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
                                  if (!newRecipientData.fullName || !selectedFiat) return true

                                  const accountConfig = getAccountTypeConfigFromCurrency(selectedFiat)
                                  const requiredFields = accountConfig.requiredFields

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
                      </div>
                    </div>

                    {/* Scrollable Recipients List - Shows exactly 2 recipients */}
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="overflow-y-auto flex-1" style={{ minHeight: '200px' }}>
                        <div className="space-y-3 pr-2 pb-2">
                          {filteredRecipients.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              {searchTerm ? (
                                <p>No recipients found matching "{searchTerm}"</p>
                              ) : (
                                <>
                                  <p>No recipients found for {selectedFiat}</p>
                                  <p className="text-sm">Add a new recipient to get started</p>
                                </>
                              )}
                            </div>
                          ) : (
                            filteredRecipients.map((recipient) => (
                              <div
                                key={recipient.id}
                                onClick={() => setSelectedRecipient(recipient.id)}
                                className={`flex items-center justify-between p-4 bg-white rounded-xl border cursor-pointer transition-colors ${
                                  selectedRecipient === recipient.id
                                    ? "border-easner-primary bg-easner-primary-50 shadow-sm"
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
                                    <p className={`font-medium ${selectedRecipient === recipient.id ? 'text-easner-primary' : 'text-gray-900'}`}>
                                      {recipient.full_name}
                                    </p>
                                    <div className="text-sm text-gray-500 space-y-0.5">
                                      {(() => {
                                        const accountConfig = getAccountTypeConfigFromCurrency(recipient.currency)
                                        const accountType = accountConfig.accountType

                                        return (
                                          <>
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
                                {selectedRecipient === recipient.id && (
                                  <div className="w-6 h-6 bg-easner-primary rounded-full flex items-center justify-center">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fixed Footer Buttons */}
                    <div className="flex gap-3 pt-6 mt-6 flex-shrink-0">
                      <Button variant="outline" onClick={() => setCreateStep(2)} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        onClick={handleCreateWallet}
                        disabled={!selectedRecipient}
                        className="flex-1 bg-easner-primary hover:bg-easner-primary-600"
                      >
                        Create Address
                      </Button>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State - Only show when no wallets and not creating */}
        {wallets.length === 0 && !showCreateFlow && (
          <div className="px-5 sm:px-6">
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="p-12 sm:p-16 text-center">
                <div className="w-20 h-20 rounded-full bg-easner-primary/10 mx-auto mb-6 flex items-center justify-center">
                  <Download className="h-10 w-10 text-easner-primary" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Addresses Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Create your first stablecoin address to start receiving stablecoins automatically convert to your local currency bank account.
                </p>
                <Button size="lg" onClick={() => setShowCreateFlow(true)} className="bg-easner-primary hover:bg-easner-primary-600">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Address
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  )
}
