"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Building2, Globe, FileText, MapPin, Edit, X, Check, ChevronDown } from "lucide-react"
import { businessInfo } from "@/lib/business-info"
import { getOnboarding, setOnboarding } from "@/lib/onboarding-store"
import { countries } from "@/lib/countries"
import { getKybFields } from "@/lib/kyb-by-country"

function getCountryFromCode(code: string) {
  return countries.find((c) => c.code === code)
}

function getInitialCountryCode(): string {
  if (typeof window === "undefined") return "US"
  const onboarding = getOnboarding()
  if (onboarding?.countryCode) return onboarding.countryCode
  const match = countries.find((c) => c.name === businessInfo.country)
  return match?.code ?? "US"
}

export function SettingsBusinessTab() {
  const [countryCode, setCountryCode] = useState("US")
  const [countryOpen, setCountryOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    businessName: businessInfo.name,
    businessType: "Financial Services",
    registrationNumber: "123456789",
    taxId: "12-3456789",
    website: businessInfo.website,
    email: businessInfo.email,
    phone: businessInfo.phone,
    address: businessInfo.address,
    city: businessInfo.city,
    state: businessInfo.state,
    zipCode: businessInfo.zipCode,
    country: businessInfo.country,
    baseCurrency: "USD",
  })

  useEffect(() => {
    const code = getInitialCountryCode()
    setCountryCode(code)
    const c = getCountryFromCode(code)
    if (c) setFormData((prev) => ({ ...prev, country: c.name }))
  }, [])

  const handleEdit = (section: string) => setEditingSection(section)
  const handleCancel = () => setEditingSection(null)
  const handleSave = (section: string) => {
    console.log(`Saving ${section}:`, formData)
    if (section === "legal") {
      const onboarding = getOnboarding()
      setOnboarding({
        countryCode,
        businessName: onboarding?.businessName ?? formData.businessName,
      })
    }
    setEditingSection(null)
  }
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountryChange = (code: string) => {
    setCountryCode(code)
    const c = getCountryFromCode(code)
    if (c) handleInputChange("country", c.name)
    setCountryOpen(false)
  }

  const selectedCountry = getCountryFromCode(countryCode)
  const kybFields = getKybFields(countryCode)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Business Information
            </CardTitle>
            {editingSection === "business" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave("business")}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleEdit("business")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleInputChange("businessName", e.target.value)}
              disabled={editingSection !== "business"}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange("businessType", e.target.value)}
                disabled={editingSection !== "business"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <Select
                value={formData.baseCurrency}
                onValueChange={(value) => handleInputChange("baseCurrency", value)}
                disabled={editingSection !== "business"}
              >
                <SelectTrigger className="h-10 w-full data-[size=default]:h-10">
                  <SelectValue placeholder="Select base currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                  <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md resize-none disabled:opacity-50"
              value="A modern digital banking platform providing seamless financial services."
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={editingSection !== "business"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Legal Entity
            </CardTitle>
            {editingSection === "legal" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave("legal")}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleEdit("legal")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Country</Label>
            {editingSection === "legal" ? (
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between h-10 font-normal"
                  >
                    {selectedCountry ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span>{selectedCountry.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Select country</span>
                    )}
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                  <Command>
                    <CommandInput placeholder="Search country..." />
                    <CommandList className="max-h-[200px]">
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((c) => (
                          <CommandItem
                            key={c.code}
                            value={c.name}
                            onSelect={() => handleCountryChange(c.code)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-lg">{c.flag}</span>
                              <span className="flex-1">{c.name}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border bg-muted/30">
                {selectedCountry && (
                  <>
                    <span className="text-lg">{selectedCountry.flag}</span>
                    <span>{selectedCountry.name}</span>
                  </>
                )}
                {!selectedCountry && <span className="text-muted-foreground">{formData.country || "—"}</span>}
              </div>
            )}
          </div>

          {kybFields.length > 0 && (
            <div className="pt-2 space-y-4">
              <div className={kybFields.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : ""}>
                {kybFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>{field.label}</Label>
                    <Input
                      id={field.id}
                      value={formData[field.id as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      disabled={editingSection !== "legal"}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address Information
            </CardTitle>
            {editingSection === "address" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave("address")}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleEdit("address")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              disabled={editingSection !== "address"}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                disabled={editingSection !== "address"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                disabled={editingSection !== "address"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) => handleInputChange("zipCode", e.target.value)}
                disabled={editingSection !== "address"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange("country", e.target.value)}
              disabled={editingSection !== "address"}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Public Information
            </CardTitle>
            {editingSection === "public" ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSave("public")}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => handleEdit("public")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              disabled={editingSection !== "public"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              disabled={editingSection !== "public"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Business Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              disabled={editingSection !== "public"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
