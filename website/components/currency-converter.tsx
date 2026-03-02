"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { currencyService } from "@/lib/currency-service"
import type { Currency, ExchangeRate } from "@easner/shared"

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

  const sendDropdownRef = useRef<HTMLDivElement>(null)
  const receiveDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [currenciesData, ratesData] = await Promise.all([
          currencyService.getAll(),
          currencyService.getExchangeRates(),
        ])

        setCurrencies(currenciesData || [])
        setExchangeRates(ratesData || [])

        if (currenciesData && currenciesData.length > 0) {
          const availableSendCurrencies = currenciesData.filter((c) => c.can_send !== false)
          if (availableSendCurrencies.length > 0) {
            const usdCurrency = availableSendCurrencies.find((c) => c.code === "USD")
            const newSendCurrency = usdCurrency ? "USD" : availableSendCurrencies[0].code
            if (newSendCurrency !== sendCurrency) setSendCurrency(newSendCurrency)

            const availableReceiveCurrencies = currenciesData.filter(
              (c) => c.can_receive !== false && c.code !== newSendCurrency
            )
            if (availableReceiveCurrencies.length > 0) {
              const ngnCurrency = availableReceiveCurrencies.find((c) => c.code === "NGN")
              const newReceiveCurrency = ngnCurrency ? "NGN" : availableReceiveCurrencies[0].code
              if (newReceiveCurrency !== receiveCurrency) setReceiveCurrency(newReceiveCurrency)
            }
          }
        }
      } catch (error) {
        console.error("Error loading currency data:", error)
      }
    }

    loadData()
  }, [])

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
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filterCurrencies = (searchTerm: string, type: "send" | "receive") => {
    let filtered = currencies
    if (type === "send") filtered = filtered.filter((c) => c.can_send !== false)
    else if (type === "receive") filtered = filtered.filter((c) => c.can_receive !== false)
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return filtered
  }

  const getExchangeRate = (from: string, to: string) =>
    exchangeRates.find((r) => r.from_currency === from && r.to_currency === to)

  const calculateFee = (amount: number, from: string, to: string) => {
    const rateData = getExchangeRate(from, to)
    if (!rateData || rateData.fee_type === "free") return { fee: 0, feeType: "free" }
    if (rateData.fee_type === "fixed") return { fee: rateData.fee_amount, feeType: "fixed" }
    if (rateData.fee_type === "percentage") return { fee: (amount * rateData.fee_amount) / 100, feeType: "percentage" }
    return { fee: 0, feeType: "free" }
  }

  const formatCurrency = (amount: number, currency: string): string => {
    const curr = currencies.find((c) => c.code === currency)
    return `${curr?.symbol || ""}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const FlagIcon = ({ currency }: { currency: Currency }) => {
    if (!currency.flag) return null
    if (currency.flag.startsWith("<svg")) return <div dangerouslySetInnerHTML={{ __html: currency.flag }} />
    if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
      return <img src={currency.flag || "/placeholder.svg"} alt={`${currency.name} flag`} width={20} height={20} />
    }
    return <span className="text-xs">{currency.code}</span>
  }

  const CurrencyDropdown = ({
    selectedCurrency,
    onCurrencyChange,
    searchTerm,
    onSearchChange,
    isOpen,
    onToggle,
    dropdownRef,
    type,
  }: {
    selectedCurrency: string
    onCurrencyChange: (currency: string) => void
    searchTerm: string
    onSearchChange: (search: string) => void
    isOpen: boolean
    onToggle: () => void
    dropdownRef: React.RefObject<HTMLDivElement>
    type: "send" | "receive"
  }) => {
    const filteredCurrencies = filterCurrencies(searchTerm, type)
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
          <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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

  const handleSendCurrencyChange = (newCurrency: string) => {
    setSendCurrency(newCurrency)
    if (newCurrency === receiveCurrency) {
      const available = currencies.filter((c) => c.can_receive !== false && c.code !== newCurrency)
      if (available.length > 0) setReceiveCurrency(available[0].code)
    } else {
      const current = currencies.find((c) => c.code === receiveCurrency)
      if (current && current.can_receive === false) {
        const available = currencies.filter((c) => c.can_receive !== false && c.code !== newCurrency)
        if (available.length > 0) setReceiveCurrency(available[0].code)
      }
    }
  }

  const handleReceiveCurrencyChange = (newCurrency: string) => {
    setReceiveCurrency(newCurrency)
    if (newCurrency === sendCurrency) {
      const available = currencies.filter((c) => c.can_send !== false && c.code !== newCurrency)
      if (available.length > 0) setSendCurrency(available[0].code)
    }
  }

  useEffect(() => {
    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (lastEditedField === "send") {
      const amount = Number.parseFloat(sendAmount) || 0
      const feeData = calculateFee(amount, sendCurrency, receiveCurrency)
      if (rate) setReceiveAmount((amount * rate.rate).toFixed(2))
      else setReceiveAmount("0")
      setFee(feeData.fee)
    } else {
      const targetReceiveAmount = Number.parseFloat(receiveAmount) || 0
      if (rate) {
        const requiredSendAmount = targetReceiveAmount / rate.rate
        setSendAmount(requiredSendAmount.toFixed(2))
        setFee(calculateFee(requiredSendAmount, sendCurrency, receiveCurrency).fee)
      } else {
        setSendAmount("0")
        setFee(0)
      }
    }
  }, [sendAmount, receiveAmount, sendCurrency, receiveCurrency, exchangeRates, lastEditedField])

  useEffect(() => {
    if (!sendCurrency || !receiveCurrency) return
    const rate = getExchangeRate(sendCurrency, receiveCurrency)
    if (rate && rate.min_amount && lastEditedField === "send") {
      const currentAmount = Number.parseFloat(sendAmount) || 0
      if (currentAmount < rate.min_amount) setSendAmount(rate.min_amount.toString())
    }
  }, [sendCurrency, receiveCurrency, exchangeRates])

  const handleSendMoney = () => {
    const exchangeRateData = getExchangeRate(sendCurrency, receiveCurrency)
    onSendMoney({
      sendAmount,
      sendCurrency,
      receiveCurrency,
      receiveAmount: Number.parseFloat(receiveAmount),
      exchangeRate: exchangeRateData?.rate || 0,
      fee,
    })
  }

  return (
    <Card className="w-full rounded-2xl shadow-lg border-0 ring-1 ring-gray-200/60 bg-white">
      <CardContent className="p-6 space-y-6">
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
                  if (value < minAmount && minAmount > 0) setSendAmount(minAmount.toString())
                  else if (maxAmount && value > maxAmount) setSendAmount(maxAmount.toString())
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
                onToggle={() => setSendDropdownOpen(!sendDropdownOpen)}
                dropdownRef={sendDropdownRef}
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
              1 {sendCurrency} = {getExchangeRate(sendCurrency, receiveCurrency)?.rate.toFixed(2) || "0.00"} {receiveCurrency}
            </span>
          </div>
        </div>

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
                    if (rate.min_amount && requiredSendAmount < rate.min_amount) {
                      requiredSendAmount = rate.min_amount
                      setReceiveAmount((requiredSendAmount * rate.rate).toFixed(2))
                      setSendAmount(requiredSendAmount.toString())
                    } else if (rate.max_amount && requiredSendAmount > rate.max_amount) {
                      requiredSendAmount = rate.max_amount
                      setReceiveAmount((requiredSendAmount * rate.rate).toFixed(2))
                      setSendAmount(requiredSendAmount.toString())
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
                onToggle={() => setReceiveDropdownOpen(!receiveDropdownOpen)}
                dropdownRef={receiveDropdownRef}
                type="receive"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">DELIVERY METHOD</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-easner-primary rounded-lg flex items-center justify-center">
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
          className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-lg font-semibold"
        >
          Send Money
        </Button>
      </CardContent>
    </Card>
  )
}
