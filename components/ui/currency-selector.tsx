"use client"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { currencies } from "@/utils/currency"

interface CurrencySelectorProps {
  selectedCurrency: string
  onCurrencyChange: (currency: string) => void
  className?: string
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange, className }: CurrencySelectorProps) {
  const selected = currencies.find((c) => c.code === selectedCurrency)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`justify-between ${className}`}>
          <div className="flex items-center gap-2">
            <img
              src={selected?.flag || "/placeholder.svg"}
              alt={`${selected?.name} flag`}
              className="w-5 h-3 object-cover rounded-sm"
            />
            <span className="font-medium">{selected?.code}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {currencies.map((currency) => (
          <DropdownMenuItem
            key={currency.code}
            onClick={() => onCurrencyChange(currency.code)}
            className="flex items-center gap-3"
          >
            <img
              src={currency.flag || "/placeholder.svg"}
              alt={`${currency.name} flag`}
              className="w-5 h-3 object-cover rounded-sm"
            />
            <div>
              <div className="font-medium">{currency.code}</div>
              <div className="text-sm text-muted-foreground">{currency.name}</div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
