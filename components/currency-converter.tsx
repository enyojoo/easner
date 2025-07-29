"use client"

import type React from "react"
import { useState } from "react"

interface CurrencyConverterProps {
  onSendMoney: (data: any) => void
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ onSendMoney }) => {
  const [sendAmount, setSendAmount] = useState<number | null>(null)
  const [sendCurrency, setSendCurrency] = useState<string | null>(null)
  const [receiveCurrency, setReceiveCurrency] = useState<string | null>(null)
  const [receiveAmount, setReceiveAmount] = useState<number | null>(null)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [fee, setFee] = useState<number | null>(null)

  const handleSendMoney = () => {
    if (!sendAmount || !sendCurrency || !receiveCurrency) return

    const data = {
      sendAmount,
      sendCurrency,
      receiveCurrency,
      receiveAmount,
      exchangeRate,
      fee,
    }

    onSendMoney(data)
  }

  // ** rest of code here **

  return (
    <div>
      {/* Currency Converter UI components here */}
      <button onClick={handleSendMoney}>Send Money</button>
    </div>
  )
}

export default CurrencyConverter
