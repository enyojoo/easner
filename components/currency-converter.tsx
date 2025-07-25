"use client"

import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { convertCurrency, formatCurrency, getExchangeRate, currencies } from "@/utils/currency"

interface CurrencyConverterProps {
  onSendMoney?: () => void
}

export function CurrencyConverter({ onSendMoney }: CurrencyConverterProps) {
  const [sendAmount, setSendAmount] = useState<string>("100")
  const [sendCurrency, setSendCurrency] = useState<string>("RUB")
  const [receiveCurrency, setReceiveCurrency] = useState<string>("NGN")
  const [receiveAmount, setReceiveAmount] = useState<number>(0)

  useEffect(() => {
    const amount = Number.parseFloat(sendAmount) || 0
    const converted = convertCurrency(amount, sendCurrency, receiveCurrency)
    setReceiveAmount(converted)
  }, [sendAmount, sendCurrency, receiveCurrency])

  const exchangeRate = getExchangeRate(sendCurrency, receiveCurrency)
  const sendCurrencyData = currencies.find((c) => c.code === sendCurrency)
  const receiveCurrencyData = currencies.find((c) => c.code === receiveCurrency)
  const totalAmount = Number.parseFloat(sendAmount) || 0

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* You Send Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">You Send</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                    className="bg-white border-gray-200 rounded-full px-3 py-1.5 h-auto hover:bg-gray-50"
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
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs">%</span>
              </div>
              <span className="text-sm text-gray-600">Rate</span>
            </div>
            <span className="font-medium text-blue-600">
              1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
            </span>
          </div>
        </div>

        {/* Receiver Gets Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Receiver Gets</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-3xl font-bold text-gray-900">{formatCurrency(receiveAmount, receiveCurrency)}</div>
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

        {/* Delivery Method */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">DELIVERY METHOD</h4>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
              <div>
                <div className="font-medium text-sm">Send to an {receiveCurrency} Bank Account</div>
                <div className="text-xs text-gray-500">Transfers within minutes</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Send Money Button */}
        <Button
          onClick={onSendMoney}
          className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full"
        >
          Send Money
        </Button>
      </CardContent>
    </Card>
  )
}
