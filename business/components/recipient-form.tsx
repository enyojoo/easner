"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ArrowLeftRight, Landmark, User, Mail, Phone, CreditCard, MapPin, ChevronDown } from "lucide-react"

interface RecipientFormProps {
  recipient?: any
  onSuccess: () => void
  isEdit?: boolean
}

const countries = [
  { name: "United States", currency: "USD", flag: "🇺🇸" },
  { name: "United Kingdom", currency: "GBP", flag: "🇬🇧" },
  { name: "Germany", currency: "EUR", flag: "🇩🇪" },
  { name: "France", currency: "EUR", flag: "🇫🇷" },
  { name: "Spain", currency: "EUR", flag: "🇪🇸" },
  { name: "Italy", currency: "EUR", flag: "🇮🇹" },
  { name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { name: "Canada", currency: "CAD", flag: "🇨🇦" },
  { name: "Australia", currency: "AUD", flag: "🇦🇺" },
]

export function RecipientForm({ recipient, onSuccess, isEdit = false }: RecipientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
    iban: "",
    bic: "",
    sortCode: "",
    country: "",
    email: "",
    phone: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [countryOpen, setCountryOpen] = useState(false)

  useEffect(() => {
    if (recipient && isEdit) {
      setFormData({
        name: recipient.name || "",
        bankName: recipient.bankName || "",
        accountNumber: recipient.fullAccountNumber || recipient.accountNumber || "",
        routingNumber: recipient.routingNumber || "",
        iban: recipient.iban || "",
        bic: recipient.bic || "",
        sortCode: recipient.sortCode || "",
        country: recipient.country || "",
        email: recipient.email || "",
        phone: recipient.phone || "",
      })
    }
  }, [recipient, isEdit])

  const selectedCountry = countries.find((c) => c.name === formData.country)
  const currency = selectedCountry?.currency || "USD"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Recipient name is required"
    }

    if (!formData.bankName.trim()) {
      newErrors.bankName = "Bank name is required"
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required"
    }

    if (!formData.country) {
      newErrors.country = "Country is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    // Currency-specific validation
    if (currency === "USD" && !formData.routingNumber.trim()) {
      newErrors.routingNumber = "Routing number is required for USD"
    }

    if (currency === "EUR") {
      if (!formData.iban.trim()) {
        newErrors.iban = "IBAN is required for EUR"
      }
      if (!formData.bic.trim()) {
        newErrors.bic = "BIC/SWIFT is required for EUR"
      }
    }

    if (currency === "GBP" && !formData.sortCode.trim()) {
      newErrors.sortCode = "Sort code is required for GBP"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Handle form submission here
      console.log("Form submitted:", formData)
      onSuccess()
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getAccountIdentifierLabel = (currency: string) => {
    switch (currency) {
      case "EUR":
        return "IBAN"
      case "GBP":
        return "Account Number"
      case "USD":
      case "NGN":
      default:
        return "Account Number"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Recipient Name
          </label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="John Doe"
            className={`h-12 placeholder:text-muted-foreground/60 capitalize ${errors.name ? "border-red-500" : ""}`}
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="john.doe@example.com"
            className={`h-12 placeholder:text-muted-foreground/60 ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 555 123 4567"
            className={`h-12 placeholder:text-muted-foreground/60 ${errors.phone ? "border-red-500" : ""}`}
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Country
          </label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <button className={`flex h-12 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${errors.country ? "border-red-500" : ""}`}>
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
            <PopoverContent className="w-[400px] p-0 z-[60]" align="start" side="bottom" sideOffset={4}>
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList className="max-h-[200px] overflow-y-auto">
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.name}
                        value={country.name}
                        onSelect={() => {
                          handleInputChange("country", country.name)
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
          {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Account Details
        </div>

        {currency === "USD" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Routing Number</label>
              <Input
                value={formData.routingNumber || ""}
                onChange={(e) => handleInputChange("routingNumber", e.target.value)}
                placeholder="121000248"
                className={`h-12 placeholder:text-muted-foreground/60 ${errors.routingNumber ? "border-red-500" : ""}`}
                required
              />
              {errors.routingNumber && <p className="text-xs text-red-500">{errors.routingNumber}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Account Number</label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                placeholder="1234567890"
                className={`h-12 placeholder:text-muted-foreground/60 normal-case ${errors.accountNumber ? "border-red-500" : ""}`}
                required
              />
              {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
            </div>
          </div>
        )}

        {currency === "EUR" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-xs text-muted-foreground">IBAN</label>
              <Input
                value={formData.iban || ""}
                onChange={(e) => handleInputChange("iban", e.target.value)}
                placeholder="DE89370400440532013000"
                className={`h-12 font-mono text-sm placeholder:text-muted-foreground/60 ${errors.iban ? "border-red-500" : ""}`}
                required
              />
              {errors.iban && <p className="text-xs text-red-500">{errors.iban}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">BIC/SWIFT</label>
              <Input
                value={formData.bic || ""}
                onChange={(e) => handleInputChange("bic", e.target.value)}
                placeholder="SOBKDEB2XXX"
                className={`h-12 font-mono text-sm placeholder:text-muted-foreground/60 ${errors.bic ? "border-red-500" : ""}`}
                required
              />
              {errors.bic && <p className="text-xs text-red-500">{errors.bic}</p>}
            </div>
          </div>
        )}

        {currency === "GBP" && (
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Sort Code</label>
              <Input
                value={formData.sortCode || ""}
                onChange={(e) => handleInputChange("sortCode", e.target.value)}
                placeholder="04-00-04"
                className={`h-12 placeholder:text-muted-foreground/60 ${errors.sortCode ? "border-red-500" : ""}`}
                required
              />
              {errors.sortCode && <p className="text-xs text-red-500">{errors.sortCode}</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs text-muted-foreground">Account Number</label>
              <Input
                value={formData.accountNumber}
                onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                placeholder="12345678"
                className={`h-12 placeholder:text-muted-foreground/60 normal-case ${errors.accountNumber ? "border-red-500" : ""}`}
                required
              />
              {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
            </div>
          </div>
        )}

        {!["USD", "EUR", "GBP"].includes(currency) && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Account Number</label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleInputChange("accountNumber", e.target.value)}
              placeholder="1234567890"
              className={`h-12 placeholder:text-muted-foreground/60 normal-case ${errors.accountNumber ? "border-red-500" : ""}`}
              required
            />
            {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber}</p>}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Bank Name</label>
          <Input
            value={formData.bankName}
            onChange={(e) => handleInputChange("bankName", e.target.value)}
            placeholder="Bank Name"
            className={`h-12 placeholder:text-muted-foreground/60 capitalize ${errors.bankName ? "border-red-500" : ""}`}
            required
          />
          {errors.bankName && <p className="text-xs text-red-500">{errors.bankName}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          {isEdit ? "Update Recipient" : "Save Recipient"}
        </Button>
      </div>
    </form>
  )
}
