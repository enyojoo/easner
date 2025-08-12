"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { currencyService } from "@/lib/database"
import type { Currency, ExchangeRate } from "@/types"

interface CurrencyConverterProps {
  onSendMoney: (data: {
    sendAmount: string
    sendCurrency: string
    receiveCurrency: string
    receiveAmount: number
    exchangeRate: number
    fee: number
  }) => void
}

export function CurrencyConverter({ onSendMoney }: CurrencyConverterProps) {
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [receiveAmount, setReceiveAmount] = useState<string>("0")
  const [sendCurrency, setSendCurrency] = useState<string>("USD")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("NGN")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [fee, setFee] = useState<number>(0)
  const [lastEditedField, setLastEditedField] = useState<"send" | "receive">("send")
  const [sendCurrencySearch, setSendCurrencySearch] = useState<string>("")
  const [receiveCurrencySearch, setReceiveCurrencySearch] = useState<string>("")
  const [sendDropdownOpen, setSendDropdownOpen] = useState<boolean>(false)
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState<boolean>(false)
  const [sendDropdownDirection, setSendDropdownDirection] = useState<"down" | "up">("down")
  const [receiveDropdownDirection, setReceiveDropdownDirection] = useState<"down" | "up">("down")

  const sendDropdownRef = useRef<HTMLDivElement>(null)
  const receiveDropdownRef = useRef<HTMLDivElement>(null)

  // Load currencies and exchange rates from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [currenciesData, ratesData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
        ])

        setCurrencies(currenciesData || [])
        setExchangeRates(ratesData || [])
      } catch (error) {
        console.error("Error loading currency data:", error)
      }
    }

    loadData()
  }, [])

  // Calculate dropdown direction based on available space
  const calculateDropdownDirection = (buttonElement: HTMLElement): "down" | "up" => {
    const rect = buttonElement.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 320 // Increased from 300 to account for search bar + padding + max-h-60

    const spaceBelow = viewportHeight - rect.bottom - 20 // Add 20px buffer
    const spaceAbove = rect.top - 20 // Add 20px buffer

    // If there's enough space below, drop down
    if (spaceBelow >= dropdownHeight) {
      return "down"
    }

    // If there's more space above than below, drop up
    if (spaceAbove > spaceBelow && spaceAbove >= dropdownHeight) {
      return "up"
    }

    // If neither has enough space, choose the one with more space
    return spaceAbove > spaceBelow ? "up" : "down"
  }

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
    direction,
  }: {
    selectedCurrency: string
    onCurrencyChange: (currency: string) => void
    searchTerm: string
    onSearchChange: (search: string) => void
    isOpen: boolean
    onToggle: () => void
    dropdownRef: React.RefObject<HTMLDivElement>
    direction: "down" | "up"
  }) => {
    const filteredCurrencies = filterCurrencies(searchTerm)
    const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency)

    const dropdownClasses =
      direction === "up"
        ? "absolute right-0 bottom-full mb-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
        : "absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"

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
          <div className={dropdownClasses}>
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

            {/* Currency List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency) => (
                  <div
                    key={currency.code}
                    onClick={() => {
                      onCurrencyChange(currency.code)
                      onSearchChange("")
                      onToggle()
                    }}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
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

  // Handle send amount change
  const handleSendAmountChange = (value: string) => {
    setSendAmount(value)
    setLastEditedField("send")
  }

  // Handle receive amount change
  const handleReceiveAmountChange = (value: string) => {
    setReceiveAmount(value)
    setLastEditedField("receive")
  }

  // Handle send dropdown toggle with direction calculation
  const handleSendDropdownToggle = () => {
    if (!sendDropdownOpen && sendDropdownRef.current) {
      const button = sendDropdownRef.current.querySelector("button")
      if (button) {
        const direction = calculateDropdownDirection(button)
        setSendDropdownDirection(direction)
      }
    }
    setSendDropdownOpen(!sendDropdownOpen)
  }

  // Handle receive dropdown toggle with direction calculation
  const handleReceiveDropdownToggle = () => {
    if (!receiveDropdownOpen && receiveDropdownRef.current) {
      const button = receiveDropdownRef.current.querySelector("button")
      if (button) {
        const direction = calculateDropdownDirection(button)
        setReceiveDropdownDirection(direction)
      }
    }
    setReceiveDropdownOpen(!receiveDropdownOpen)
  }

  // Update the useEffect to calculate conversions based on last edited field
  useEffect(() => {
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
    } else {
      // Calculate send amount from receive amount (reverse calculation)
      const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0

      if (rate) {
        // To get the target receive amount, we need to work backwards
        // receiveAmount = sendAmount * rate
        // So: sendAmount = receiveAmount / rate
        const requiredSendAmount = targetReceiveAmount / rate.rate
        setSendAmount(requiredSendAmount.toFixed(2))

        // Calculate fee based on the required send amount
        const feeData = calculateFee(requiredSendAmount, sendCurrency, receiveCurrency)
        setFee(feeData.fee)
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
    if (rate && rate.min_amount && lastEditedField === "send") {
      const currentAmount = Number.parseFloat(sendAmount) || 0
      if (currentAmount < rate.min_amount) {
        setSendAmount(rate.min_amount.toString())
      }
    }
  }, [sendCurrency, receiveCurrency, exchangeRates])

  const handleSendMoney = () => {
    const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)
    const exchangeRate = exchangeRateData?.rate || 0

    onSendMoney({
      sendAmount,
      sendCurrency,
      receiveCurrency,
      receiveAmount: Number.parseFloat(receiveAmount),
      exchangeRate,
      fee,
    })
  }

  return (
    <Card className="w-full shadow-2xl border-0 ring-1 ring-gray-100 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        {/* You Send Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">You Send</h3>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <input
                type="number"
                value={sendAmount}
                onChange={(e) => handleSendAmountChange(e.target.value)}
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
                onToggle={handleSendDropdownToggle}
                dropdownRef={sendDropdownRef}
                direction={sendDropdownDirection}
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
              <div className="w-5 h-5 bg-novapay-primary-100 rounded-full flex items-center justify-center">
                <span className="text-novapay-primary text-xs">%</span>
              </div>
              <span className="text-sm text-gray-600">Rate</span>
            </div>
            <span className="font-medium text-novapay-primary">
              1 {sendCurrency} = {getExchangeRate(sendCurrency, receiveCurrency)?.rate.toFixed(4) || "0.0000"}{" "}
              {receiveCurrency}
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
                onChange={(e) => handleReceiveAmountChange(e.target.value)}
                className="text-3xl font-bold bg-transparent border-0 outline-none w-full"
                placeholder="0.00"
              />
              <CurrencyDropdown
                selectedCurrency={receiveCurrency}
                onCurrencyChange={handleReceiveCurrencyChange}
                searchTerm={receiveCurrencySearch}
                onSearchChange={setReceiveCurrencySearch}
                isOpen={receiveDropdownOpen}
                onToggle={handleReceiveDropdownToggle}
                dropdownRef={receiveDropdownRef}
                direction={receiveDropdownDirection}
              />
            </div>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">DELIVERY METHOD</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-novapay-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
              <div>
                <div className="font-medium text-sm">Send to {receiveCurrency} Bank Account</div>
                <div className="text-xs text-gray-500">Transfers within minutes</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Button
          onClick={handleSendMoney}
          className="w-full bg-novapay-primary hover:bg-novapay-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-semibold"
        >
          Send Money
        </Button>
      </CardContent>
    </Card>
  )
}
