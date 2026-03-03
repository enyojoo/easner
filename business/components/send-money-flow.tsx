"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { mockAccounts, currencySymbols } from "@/lib/mock-data"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  User,
  Building2,
  MapPin,
  CreditCard,
  ChevronDown,
  ArrowRightLeft,
  Lock,
  Mail,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Currency =
  | "USD"
  | "EUR"
  | "GBP"
  | "NGN"
  | "CAD"
  | "AUD"
  | "JPY"
  | "CHF"
  | "SEK"
  | "NOK"
  | "DKK"
  | "PLN"
  | "CZK"
  | "HUF"
  | "RON"
  | "BGN"
  | "HRK"
  | "RSD"
  | "MKD"
  | "BAM"
  | "ALL"
  | "TRY"
  | "ILS"
  | "AED"
  | "SAR"
  | "QAR"
  | "KWD"
  | "BHD"
  | "OMR"
  | "JOD"
  | "LBP"
  | "EGP"
  | "MAD"
  | "TND"
  | "DZD"
  | "LYD"
  | "SDG"
  | "ETB"
  | "KES"
  | "UGX"
  | "TZS"
  | "RWF"
  | "BIF"
  | "DJF"
  | "SOS"
  | "SCR"
  | "MUR"
  | "KMF"
  | "MGA"
  | "XOF"
  | "XAF"
  | "GHS"
  | "GMD"
  | "GNF"
  | "LRD"
  | "SLL"
  | "STN"
  | "CVE"
  | "MRU"
  | "ZAR"
  | "NAD"
  | "BWP"
  | "LSL"
  | "SZL"
  | "ZMW"
  | "ZWL"
  | "MWK"
  | "MZN"
  | "AOA"
  | "CDF"
  | "XPF"
  | "FJD"
  | "PGK"
  | "SBD"
  | "TOP"
  | "VUV"
  | "WST"
  | "BND"
  | "KHR"
  | "LAK"
  | "MMK"
  | "PHP"
  | "THB"
  | "VND"
  | "IDR"
  | "MYR"
  | "SGD"
  | "HKD"
  | "TWD"
  | "KRW"
  | "CNY"
  | "INR"
  | "PKR"
  | "BDT"
  | "LKR"
  | "NPR"
  | "BTN"
  | "MVR"
  | "AFN"
  | "IRR"
  | "IQD"
  | "SYP"
  | "YER"
  | "UZS"
  | "TJS"
  | "TMT"
  | "AZN"
  | "GEL"
  | "AMD"
  | "KGS"
  | "KZT"
  | "MNT"
  | "BRL"
  | "ARS"
  | "CLP"
  | "COP"
  | "PEN"
  | "UYU"
  | "PYG"
  | "BOB"
  | "VES"
  | "GYD"
  | "SRD"
  | "TTD"
  | "JMD"
  | "BBD"
  | "BSD"
  | "BZD"
  | "XCD"
  | "AWG"
  | "ANG"
  | "CUP"
  | "DOP"
  | "GTQ"
  | "HNL"
  | "NIO"
  | "PAB"
  | "CRC"
  | "HTG"
  | "MXN"
  | "ISK"
  | "RUB"
  | "UAH"
  | "BYN"
  | "MDL"

const countries = [
  { name: "United States", flag: "🇺🇸", currency: "USD" as Currency },
  { name: "United Kingdom", flag: "🇬🇧", currency: "GBP" as Currency },
  { name: "Germany", flag: "🇩🇪", currency: "EUR" as Currency },
  { name: "France", flag: "🇫🇷", currency: "EUR" as Currency },
  { name: "Spain", flag: "🇪🇸", currency: "EUR" as Currency },
  { name: "Italy", flag: "🇮🇹", currency: "EUR" as Currency },
  { name: "Netherlands", flag: "🇳🇱", currency: "EUR" as Currency },
  { name: "Belgium", flag: "🇧🇪", currency: "EUR" as Currency },
  { name: "Nigeria", flag: "🇳🇬", currency: "NGN" as Currency },
  { name: "Canada", flag: "🇨🇦", currency: "CAD" as Currency },
  { name: "Australia", flag: "🇦🇺", currency: "AUD" as Currency },
  { name: "Japan", flag: "🇯🇵", currency: "JPY" as Currency },
  { name: "Switzerland", flag: "🇨🇭", currency: "CHF" as Currency },
  { name: "Sweden", flag: "🇸🇪", currency: "SEK" as Currency },
  { name: "Norway", flag: "🇳🇴", currency: "NOK" as Currency },
  { name: "Denmark", flag: "🇩🇰", currency: "DKK" as Currency },
  { name: "Poland", flag: "🇵🇱", currency: "PLN" as Currency },
  { name: "South Africa", flag: "🇿🇦", currency: "ZAR" as Currency },
  { name: "Brazil", flag: "🇧🇷", currency: "BRL" as Currency },
  { name: "Mexico", flag: "🇲🇽", currency: "MXN" as Currency },
  { name: "India", flag: "🇮🇳", currency: "INR" as Currency },
  { name: "China", flag: "🇨🇳", currency: "CNY" as Currency },
  { name: "Singapore", flag: "🇸🇬", currency: "SGD" as Currency },
  { name: "Hong Kong", flag: "🇭🇰", currency: "HKD" as Currency },
  { name: "South Korea", flag: "🇰🇷", currency: "KRW" as Currency },
  { name: "New Zealand", flag: "🇳🇿", currency: "NZD" as Currency },
  { name: "Ireland", flag: "🇮🇪", currency: "EUR" as Currency },
  { name: "Portugal", flag: "🇵🇹", currency: "EUR" as Currency },
  { name: "Austria", flag: "🇦🇹", currency: "EUR" as Currency },
  { name: "Finland", flag: "🇫🇮", currency: "EUR" as Currency },
  { name: "Greece", flag: "🇬🇷", currency: "EUR" as Currency },
  { name: "Czech Republic", flag: "🇨🇿", currency: "CZK" as Currency },
  { name: "Hungary", flag: "🇭🇺", currency: "HUF" as Currency },
  { name: "Romania", flag: "🇷🇴", currency: "RON" as Currency },
  { name: "Turkey", flag: "🇹🇷", currency: "TRY" as Currency },
  { name: "Israel", flag: "🇮🇱", currency: "ILS" as Currency },
  { name: "UAE", flag: "🇦🇪", currency: "AED" as Currency },
  { name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR" as Currency },
  { name: "Kenya", flag: "🇰🇪", currency: "KES" as Currency },
  { name: "Ghana", flag: "🇬🇭", currency: "GHS" as Currency },
  { name: "Egypt", flag: "🇪🇬", currency: "EGP" as Currency },
  { name: "Morocco", flag: "🇲🇦", currency: "MAD" as Currency },
  { name: "Argentina", flag: "🇦🇷", currency: "ARS" as Currency },
  { name: "Chile", flag: "🇨🇱", currency: "CLP" as Currency },
  { name: "Colombia", flag: "🇨🇴", currency: "COP" as Currency },
  { name: "Peru", flag: "🇵🇪", currency: "PEN" as Currency },
  { name: "Thailand", flag: "🇹🇭", currency: "THB" as Currency },
  { name: "Vietnam", flag: "🇻🇳", currency: "VND" as Currency },
  { name: "Indonesia", flag: "🇮🇩", currency: "IDR" as Currency },
  { name: "Malaysia", flag: "🇲🇾", currency: "MYR" as Currency },
  { name: "Philippines", flag: "🇵🇭", currency: "PHP" as Currency },
]

const currencyNames: Record<string, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  NGN: "Nigerian Naira",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  JPY: "Japanese Yen",
  CHF: "Swiss Franc",
  SEK: "Swedish Krona",
  NOK: "Norwegian Krone",
  DKK: "Danish Krone",
  PLN: "Polish Zloty",
  ZAR: "South African Rand",
  BRL: "Brazilian Real",
  MXN: "Mexican Peso",
  INR: "Indian Rupee",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
  NZD: "New Zealand Dollar",
  CZK: "Czech Koruna",
  HUF: "Hungarian Forint",
  RON: "Romanian Leu",
  TRY: "Turkish Lira",
  ILS: "Israeli Shekel",
  AED: "UAE Dirham",
  SAR: "Saudi Riyal",
  KES: "Kenyan Shilling",
  GHS: "Ghanaian Cedi",
  EGP: "Egyptian Pound",
  MAD: "Moroccan Dirham",
  ARS: "Argentine Peso",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  PEN: "Peruvian Sol",
  THB: "Thai Baht",
  VND: "Vietnamese Dong",
  IDR: "Indonesian Rupiah",
  MYR: "Malaysian Ringgit",
  PHP: "Philippine Peso",
}

interface RecipientInfo {
  name: string
  email: string
  phone: string
  accountNumber: string
  routingNumber?: string
  iban?: string
  bic?: string
  sortCode?: string
  country: string
  bankName: string
}

export function SendMoneyFlow() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState<RecipientInfo>({
    name: "",
    email: "",
    phone: "",
    accountNumber: "",
    country: "",
    bankName: "",
  })
  const [selectedAccountId, setSelectedAccountId] = useState("")
  const [countryOpen, setCountryOpen] = useState(false)
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pin, setPin] = useState("")

  const selectedCountry = countries.find((c) => c.name === recipient.country)
  const currency = selectedCountry?.currency || "USD"
  
  const getCurrencyFlag = (currency: string) => {
    const currencyFlags: Record<string, string> = {
      "USD": "🇺🇸",
      "EUR": "🇪🇺", 
      "GBP": "🇬🇧",
      "NGN": "🇳🇬"
    }
    return currencyFlags[currency] || "🏦"
  }

  // Mock conversion rates (1 USD = X other currency)
  const conversionRates: Record<string, Record<string, number>> = {
    "USD": { "EUR": 0.85, "GBP": 0.73, "NGN": 1500 },
    "EUR": { "USD": 1.18, "GBP": 0.86, "NGN": 1765 },
    "GBP": { "USD": 1.37, "EUR": 1.16, "NGN": 2055 },
    "NGN": { "USD": 0.00067, "EUR": 0.00057, "GBP": 0.00049 }
  }

  // Get conversion rate between any two currencies
  const getConversionRate = (fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return 1
    return conversionRates[fromCurrency]?.[toCurrency] || 1
  }

  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount
    const rate = getConversionRate(fromCurrency, toCurrency)
    return amount * rate
  }

  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const hasMatchingCurrencyAccount = mockAccounts.some(
    (acc) => acc.currency === currency && acc.availableBalance >= Number.parseFloat(amount || "0"),
  )

  const hasAnySufficientAccount = mockAccounts.some(
    (acc) => acc.availableBalance >= Number.parseFloat(amount || "0"),
  )

  const suggestedAccount = hasMatchingCurrencyAccount
    ? mockAccounts.find((acc) => acc.currency === currency && acc.availableBalance >= Number.parseFloat(amount || "0"))
    : hasAnySufficientAccount
      ? mockAccounts.find((acc) => acc.currency === "USD" && acc.availableBalance >= Number.parseFloat(amount || "0"))
      : null

  const selectedAccount = mockAccounts.find((acc) => acc.id === selectedAccountId) || suggestedAccount

  const getTransferMethod = () => {
    if (currency === "USD" && recipient.country === "United States") return "ACH"
    if (currency === "EUR") return "SEPA"
    if (currency === "GBP" && recipient.country === "United Kingdom") return "Faster Payments"
    return "Wire Transfer"
  }

  const transferMethod = getTransferMethod()

  const handleNext = () => {
    if (step === 3 && !selectedAccountId && suggestedAccount) {
      setSelectedAccountId(suggestedAccount.id)
    }
    setStep(step + 1)
  }

  const handlePinSubmit = () => {
    if (pin.length === 4) {
      const transferId = `TXN${Date.now()}`
      router.push(
        `/send/status?id=${transferId}&amount=${amount}&currency=${currency}&recipient=${encodeURIComponent(recipient.name)}`,
      )
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Who are you sending to?</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter beneficiary information</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`h-1 rounded-full flex-1 transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Country
                  </label>
                  <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                    <PopoverTrigger asChild>
                      <button className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                        {selectedCountry ? (
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{selectedCountry.flag}</span>
                            <span>{selectedCountry.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Select country</span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search country..." />
                        <CommandList>
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandGroup>
                            {countries.map((country) => (
                              <CommandItem
                                key={country.name}
                                value={country.name}
                                onSelect={() => {
                                  setRecipient({ ...recipient, country: country.name })
                                  setCountryOpen(false)
                                }}
                              >
                                <div className="flex items-center gap-2 w-full">
                                  <span className="text-lg">{country.flag}</span>
                                  <span className="flex-1">{country.name}</span>
                                  <span className="text-xs text-muted-foreground">({country.currency})</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Beneficiary Name
                  </label>
                  <Input
                    value={recipient.name}
                    onChange={(e) => setRecipient({ ...recipient, name: e.target.value })}
                    placeholder="John Doe"
                    className="h-12 placeholder:text-muted-foreground/60 capitalize"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    Email Address
                  </label>
                  <Input
                    value={recipient.email}
                    onChange={(e) => setRecipient({ ...recipient, email: e.target.value })}
                    placeholder="john.doe@example.com"
                    type="email"
                    className="h-12 placeholder:text-muted-foreground/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Phone Number
                  </label>
                  <Input
                    value={recipient.phone}
                    onChange={(e) => setRecipient({ ...recipient, phone: e.target.value })}
                    placeholder="+1 555 123 4567"
                    type="tel"
                    className="h-12 placeholder:text-muted-foreground/60"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {recipient.country && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Account Details
                </div>

                {currency === "USD" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Routing Number</label>
                      <Input
                        value={recipient.routingNumber || ""}
                        onChange={(e) => setRecipient({ ...recipient, routingNumber: e.target.value })}
                        placeholder="121000248"
                        className="h-12 placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Account Number</label>
                      <Input
                        value={recipient.accountNumber}
                        onChange={(e) => setRecipient({ ...recipient, accountNumber: e.target.value })}
                        placeholder="1234567890"
                        className="h-12 placeholder:text-muted-foreground/60 normal-case"
                        required
                      />
                    </div>
                  </div>
                )}

                {currency === "EUR" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">IBAN</label>
                      <Input
                        value={recipient.iban || ""}
                        onChange={(e) => setRecipient({ ...recipient, iban: e.target.value })}
                        placeholder="DE89370400440532013000"
                        className="h-12 font-mono text-sm placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">BIC/SWIFT</label>
                      <Input
                        value={recipient.bic || ""}
                        onChange={(e) => setRecipient({ ...recipient, bic: e.target.value })}
                        placeholder="SOBKDEB2XXX"
                        className="h-12 font-mono text-sm placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                  </div>
                )}

                {currency === "GBP" && (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Sort Code</label>
                      <Input
                        value={recipient.sortCode || ""}
                        onChange={(e) => setRecipient({ ...recipient, sortCode: e.target.value })}
                        placeholder="04-00-04"
                        className="h-12 placeholder:text-muted-foreground/60"
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs text-muted-foreground">Account Number</label>
                      <Input
                        value={recipient.accountNumber}
                        onChange={(e) => setRecipient({ ...recipient, accountNumber: e.target.value })}
                        placeholder="12345678"
                        className="h-12 placeholder:text-muted-foreground/60 normal-case"
                        required
                      />
                    </div>
                  </div>
                )}

                {!["USD", "EUR", "GBP"].includes(currency) && (
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground">Account Number</label>
                    <Input
                      value={recipient.accountNumber}
                      onChange={(e) => setRecipient({ ...recipient, accountNumber: e.target.value })}
                      placeholder="1234567890"
                      className="h-12 placeholder:text-muted-foreground/60 normal-case"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Bank Name</label>
                  <Input
                    value={recipient.bankName}
                    onChange={(e) => setRecipient({ ...recipient, bankName: e.target.value })}
                    placeholder="Bank Name"
                    className="h-12 placeholder:text-muted-foreground/60 capitalize"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleNext}
            disabled={!recipient.name || !recipient.email || !recipient.phone || !recipient.accountNumber || !recipient.country || !recipient.bankName}
            size="lg"
            className="w-full h-11"
          >
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">How much would you like to send?</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the amount to send</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`h-1 rounded-full flex-1 transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sending to</p>
                  <p className="font-semibold text-lg">{formatName(recipient.name)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getCurrencyFlag(currency)}</span>
                  <p className="font-medium">{currencyNames[currency]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Country</p>
                  <p className="text-sm font-medium">{recipient.country}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Bank Name</p>
                  <p className="text-sm font-medium">{recipient.bankName}</p>
                </div>
              </div>

              <div className="pt-2">
                {currency === "USD" && recipient.routingNumber && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                      <p className="text-sm font-mono">{recipient.routingNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                      <p className="text-sm font-mono">{recipient.accountNumber}</p>
                    </div>
                  </div>
                )}

                {currency === "EUR" && recipient.iban && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                      <p className="text-sm font-mono">{recipient.iban}</p>
                    </div>
                    {recipient.bic && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">BIC/SWIFT</p>
                        <p className="text-sm font-mono">{recipient.bic}</p>
                      </div>
                    )}
                  </div>
                )}

                {currency === "GBP" && recipient.sortCode && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sort Code</p>
                      <p className="text-sm font-mono">{recipient.sortCode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                      <p className="text-sm font-mono">{recipient.accountNumber}</p>
                    </div>
                  </div>
                )}

                {!["USD", "EUR", "GBP"].includes(currency) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                    <p className="text-sm font-mono">{recipient.accountNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-5xl text-muted-foreground font-semibold">
                {currencySymbols[currency]}
              </span>
              <Input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '')
                  if (value === '' || /^\d*\.?\d*$/.test(value)) {
                    setAmount(value)
                  }
                }}
                className="h-28 !text-5xl pl-16 border-0 shadow-sm font-semibold"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!amount || Number.parseFloat(amount) <= 0}
              size="lg"
              className="flex-1 h-11"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Choose source account</h1>
            <p className="text-sm text-muted-foreground mt-1">Select which account to send from</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`h-1 rounded-full flex-1 transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sending</p>
                  <p className="text-2xl font-semibold">
                    {currencySymbols[currency]}
                    {Number.parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">To</p>
                  <p className="font-medium">{formatName(recipient.name)}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                    {formatName(recipient.bankName)} • {recipient.accountNumber}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm relative">
            <CardContent className="p-6">
              {suggestedAccount ? (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground mb-2">Sending from</p>
                        <p className="font-semibold text-xl mb-1">
                          {selectedAccount?.accountName || suggestedAccount?.accountName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAccount?.bankName || suggestedAccount?.bankName} •{" "}
                          {selectedAccount?.fullAccountNumber || suggestedAccount?.fullAccountNumber}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getCurrencyFlag(selectedAccount?.currency || suggestedAccount?.currency)}
                      </span>
                      <p className="font-medium">
                        {currencyNames[selectedAccount?.currency || suggestedAccount?.currency]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                        <p className="text-3xl font-semibold">
                          {currencySymbols[selectedAccount?.currency || suggestedAccount?.currency]}
                          {(selectedAccount?.availableBalance || suggestedAccount?.availableBalance).toLocaleString(
                            "en-US",
                            { minimumFractionDigits: 2 },
                          )}
                        </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">After transfer</p>
                      <p className="text-lg font-medium text-muted-foreground">
                        {currencySymbols[selectedAccount?.currency || suggestedAccount?.currency]}
                        {(
                          (selectedAccount?.availableBalance || suggestedAccount?.availableBalance) -
                          convertAmount(Number.parseFloat(amount), currency, selectedAccount?.currency || suggestedAccount?.currency)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-red-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Insufficient Balance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    None of your accounts have enough balance to cover this transfer of{" "}
                    <span className="font-semibold">
                      {currencySymbols[currency]}
                      {Number.parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You can switch accounts below to see all available balances, or reduce the transfer amount.
                  </p>
                </div>
              )}

              <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors text-xs font-medium text-muted-foreground hover:text-foreground">
                      <ArrowRightLeft className="h-3 w-3" />
                      Switch Account
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Select account</h3>
                      <p className="text-xs text-muted-foreground mt-1">Choose an account with sufficient balance</p>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                      {mockAccounts.map((acc) => {
                        const isSelected =
                          selectedAccount?.id === acc.id || (!selectedAccountId && acc.id === suggestedAccount?.id)
                        const isDifferentCurrency = acc.currency !== currency
                        const transferAmount = Number.parseFloat(amount || "0")
                        const convertedAmount = convertAmount(transferAmount, currency, acc.currency)
                        const hasInsufficientBalance = acc.availableBalance < convertedAmount
                        const isInsufficient = hasInsufficientBalance

                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              setSelectedAccountId(acc.id)
                              setAccountPopoverOpen(false)
                            }}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/5"
                                : isInsufficient
                                  ? "border-red-200 bg-red-50/50 hover:border-red-300"
                                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{acc.accountName}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {acc.bankName} • {acc.fullAccountNumber}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                    <Check className="h-3 w-3" />
                                  </div>
                                )}
                                {isInsufficient && (
                                  <div className="bg-red-100 text-red-600 rounded-full p-1">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground">Available</p>
                                <p className={`text-sm font-semibold ${isInsufficient ? "text-red-600" : ""}`}>
                                  {currencySymbols[acc.currency]}
                                  {acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </p>
                                {isInsufficient && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Need {currencySymbols[acc.currency]}
                                    {(convertedAmount - acc.availableBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })}{" "}
                                    more
                                  </p>
                                )}
                              </div>

                              {isDifferentCurrency && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ArrowRightLeft className="h-3 w-3" />
                                  <span>Conversion</span>
                                </div>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

          <div className="flex gap-3">
            <Button onClick={() => setStep(2)} variant="outline" size="lg" className="h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!selectedAccount || (selectedAccount.availableBalance < Number.parseFloat(amount) && selectedAccount.currency === currency)}
              size="lg"
              className="flex-1 h-11"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 4 && selectedAccount && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Review and authorize</h1>
            <p className="text-sm text-muted-foreground mt-1">Confirm all details before sending</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`h-1 rounded-full flex-1 transition-all ${s <= step ? "bg-primary" : "bg-muted"}`} />
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-sm bg-primary/5">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">You're sending</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <p className="text-5xl font-semibold">
                  {currencySymbols[currency]}
                  {Number.parseFloat(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">From Account</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">{selectedAccount.accountName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAccount.bankName} • {selectedAccount.fullAccountNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {getCurrencyFlag(selectedAccount.currency)}
                    </span>
                    <p className="text-sm font-medium">{currencyNames[selectedAccount.currency]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-lg font-semibold">
                      {currencySymbols[selectedAccount.currency]}
                      {selectedAccount.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Balance After Transfer</p>
                    <p className="text-lg font-medium text-muted-foreground">
                      {currencySymbols[selectedAccount.currency]}
                      {(selectedAccount.availableBalance - Number.parseFloat(amount)).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">To Recipient</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">{formatName(recipient.name)}</p>
                    <p className="text-sm text-muted-foreground mb-1">{formatName(recipient.bankName)}</p>
                    <p className="text-xs text-muted-foreground">{recipient.email}</p>
                    <p className="text-xs text-muted-foreground">{recipient.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getCurrencyFlag(currency)}</span>
                    <p className="text-sm font-medium">{currencyNames[currency]}</p>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  {currency === "USD" && recipient.routingNumber && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Routing Number</p>
                        <p className="text-sm font-mono">{recipient.routingNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                        <p className="text-sm font-mono">{recipient.accountNumber}</p>
                      </div>
                    </div>
                  )}

                  {currency === "EUR" && recipient.iban && (
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">IBAN</p>
                        <p className="text-sm font-mono">{recipient.iban}</p>
                      </div>
                      {recipient.bic && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">BIC/SWIFT</p>
                          <p className="text-sm font-mono">{recipient.bic}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {currency === "GBP" && recipient.sortCode && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Sort Code</p>
                        <p className="text-sm font-mono">{recipient.sortCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                        <p className="text-sm font-mono">{recipient.accountNumber}</p>
                      </div>
                    </div>
                  )}

                  {!["USD", "EUR", "GBP"].includes(currency) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Account Number</p>
                      <p className="text-sm font-mono">{recipient.accountNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Transfer Details</p>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transfer Method</span>
                  <span className="font-medium">{transferMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Processing Time</span>
                  <span className="font-medium">
                    {transferMethod === "ACH"
                      ? "1-3 business days"
                      : transferMethod === "SEPA"
                        ? "1-2 business days"
                        : transferMethod === "Faster Payments"
                          ? "Within minutes"
                          : "Same day"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-sm text-muted-foreground">Transfer Fee</span>
                  <span className="font-semibold">{transferMethod === "Wire Transfer" ? "$25.00" : "$0.00"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => setStep(3)} variant="outline" size="lg" className="h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => setShowPinDialog(true)} size="lg" className="flex-1 h-11">
              Authorize Transfer
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Enter Transfer PIN
            </DialogTitle>
            <DialogDescription>Enter your 4-digit PIN to authorize this transfer</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="relative flex justify-center gap-3">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-12 h-12 border-2 rounded-lg flex items-center justify-center text-2xl font-semibold bg-background ${
                    pin.length === index ? "border-primary" : "border-input"
                  }`}
                >
                  {pin[index] || ""}
                </div>
              ))}
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder=""
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                autoFocus
              />
            </div>
            <Button onClick={handlePinSubmit} disabled={pin.length !== 4} className="w-full h-11" size="lg">
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
