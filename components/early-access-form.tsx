"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Loader2, Send, ChevronDown, Search } from "lucide-react"
import Link from "next/link"

interface EarlyAccessFormData {
  email: string
  fullName: string
  whatsappTelegram: string
  primaryUseCase: string
  locatedIn: string
  sendingTo: string
}

const COUNTRIES = [
  // Priority countries first
  { code: "EE", name: "Estonia" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "NG", name: "Nigeria" },
  
  // Rest in alphabetical order
  { code: "AD", name: "Andorra" },
  { code: "AF", name: "Afghanistan" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AL", name: "Albania" },
  { code: "AM", name: "Armenia" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AS", name: "American Samoa" },
  { code: "AT", name: "Austria" },
  { code: "AU", name: "Australia" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BB", name: "Barbados" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgium" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BG", name: "Bulgaria" },
  { code: "BH", name: "Bahrain" },
  { code: "BI", name: "Burundi" },
  { code: "BJ", name: "Benin" },
  { code: "BO", name: "Bolivia" },
  { code: "BR", name: "Brazil" },
  { code: "BS", name: "Bahamas" },
  { code: "BT", name: "Bhutan" },
  { code: "BW", name: "Botswana" },
  { code: "BY", name: "Belarus" },
  { code: "BZ", name: "Belize" },
  { code: "CA", name: "Canada" },
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "CF", name: "Central African Republic" },
  { code: "CG", name: "Republic of the Congo" },
  { code: "CH", name: "Switzerland" },
  { code: "CI", name: "Côte d'Ivoire" },
  { code: "CK", name: "Cook Islands" },
  { code: "CL", name: "Chile" },
  { code: "CM", name: "Cameroon" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "CU", name: "Cuba" },
  { code: "CV", name: "Cape Verde" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DE", name: "Germany" },
  { code: "DJ", name: "Djibouti" },
  { code: "DK", name: "Denmark" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "DZ", name: "Algeria" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "ER", name: "Eritrea" },
  { code: "ES", name: "Spain" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FJ", name: "Fiji" },
  { code: "FK", name: "Falkland Islands" },
  { code: "FM", name: "Micronesia" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GD", name: "Grenada" },
  { code: "GE", name: "Georgia" },
  { code: "GF", name: "French Guiana" },
  { code: "GH", name: "Ghana" },
  { code: "GM", name: "Gambia" },
  { code: "GN", name: "Guinea" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "GR", name: "Greece" },
  { code: "GS", name: "South Georgia and the South Sandwich Islands" },
  { code: "GT", name: "Guatemala" },
  { code: "GU", name: "Guam" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HK", name: "Hong Kong" },
  { code: "HN", name: "Honduras" },
  { code: "HR", name: "Croatia" },
  { code: "HT", name: "Haiti" },
  { code: "HU", name: "Hungary" },
  { code: "ID", name: "Indonesia" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IN", name: "India" },
  { code: "IQ", name: "Iraq" },
  { code: "IR", name: "Iran" },
  { code: "IS", name: "Iceland" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JO", name: "Jordan" },
  { code: "JP", name: "Japan" },
  { code: "KE", name: "Kenya" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "KI", name: "Kiribati" },
  { code: "KM", name: "Comoros" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "LA", name: "Laos" },
  { code: "LB", name: "Lebanon" },
  { code: "LC", name: "Saint Lucia" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LK", name: "Sri Lanka" },
  { code: "LR", name: "Liberia" },
  { code: "LS", name: "Lesotho" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "LV", name: "Latvia" },
  { code: "LY", name: "Libya" },
  { code: "MA", name: "Morocco" },
  { code: "MC", name: "Monaco" },
  { code: "MD", name: "Moldova" },
  { code: "ME", name: "Montenegro" },
  { code: "MG", name: "Madagascar" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MK", name: "North Macedonia" },
  { code: "ML", name: "Mali" },
  { code: "MM", name: "Myanmar" },
  { code: "MN", name: "Mongolia" },
  { code: "MO", name: "Macau" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "MQ", name: "Martinique" },
  { code: "MR", name: "Mauritania" },
  { code: "MS", name: "Montserrat" },
  { code: "MT", name: "Malta" },
  { code: "MU", name: "Mauritius" },
  { code: "MV", name: "Maldives" },
  { code: "MW", name: "Malawi" },
  { code: "MX", name: "Mexico" },
  { code: "MY", name: "Malaysia" },
  { code: "MZ", name: "Mozambique" },
  { code: "NA", name: "Namibia" },
  { code: "NC", name: "New Caledonia" },
  { code: "NE", name: "Niger" },
  { code: "NF", name: "Norfolk Island" },
  { code: "NI", name: "Nicaragua" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "NP", name: "Nepal" },
  { code: "NR", name: "Nauru" },
  { code: "NU", name: "Niue" },
  { code: "NZ", name: "New Zealand" },
  { code: "OM", name: "Oman" },
  { code: "PA", name: "Panama" },
  { code: "PE", name: "Peru" },
  { code: "PF", name: "French Polynesia" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PH", name: "Philippines" },
  { code: "PK", name: "Pakistan" },
  { code: "PL", name: "Poland" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "PN", name: "Pitcairn Islands" },
  { code: "PR", name: "Puerto Rico" },
  { code: "PS", name: "Palestine" },
  { code: "PT", name: "Portugal" },
  { code: "PW", name: "Palau" },
  { code: "PY", name: "Paraguay" },
  { code: "QA", name: "Qatar" },
  { code: "RE", name: "Réunion" },
  { code: "RO", name: "Romania" },
  { code: "RS", name: "Serbia" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SC", name: "Seychelles" },
  { code: "SD", name: "Sudan" },
  { code: "SE", name: "Sweden" },
  { code: "SG", name: "Singapore" },
  { code: "SH", name: "Saint Helena" },
  { code: "SI", name: "Slovenia" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SK", name: "Slovakia" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SM", name: "San Marino" },
  { code: "SN", name: "Senegal" },
  { code: "SO", name: "Somalia" },
  { code: "SR", name: "Suriname" },
  { code: "SS", name: "South Sudan" },
  { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SV", name: "El Salvador" },
  { code: "SY", name: "Syria" },
  { code: "SZ", name: "Eswatini" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TD", name: "Chad" },
  { code: "TF", name: "French Southern Territories" },
  { code: "TG", name: "Togo" },
  { code: "TH", name: "Thailand" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TK", name: "Tokelau" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TN", name: "Tunisia" },
  { code: "TO", name: "Tonga" },
  { code: "TR", name: "Turkey" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TV", name: "Tuvalu" },
  { code: "TW", name: "Taiwan" },
  { code: "TZ", name: "Tanzania" },
  { code: "UA", name: "Ukraine" },
  { code: "UG", name: "Uganda" },
  { code: "UM", name: "United States Minor Outlying Islands" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VA", name: "Vatican City" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "VE", name: "Venezuela" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "VN", name: "Vietnam" },
  { code: "VU", name: "Vanuatu" },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "WS", name: "Samoa" },
  { code: "YE", name: "Yemen" },
  { code: "YT", name: "Mayotte" },
  { code: "ZA", name: "South Africa" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" }
]

export function EarlyAccessForm() {
  const [formData, setFormData] = useState<EarlyAccessFormData>({
    email: "",
    fullName: "",
    whatsappTelegram: "",
    primaryUseCase: "",
    locatedIn: "",
    sendingTo: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [isPrimaryUseCaseDropdownOpen, setIsPrimaryUseCaseDropdownOpen] = useState(false)
  const [isLocatedInDropdownOpen, setIsLocatedInDropdownOpen] = useState(false)
  const [isSendingToDropdownOpen, setIsSendingToDropdownOpen] = useState(false)
  const [primaryUseCaseDropdownPosition, setPrimaryUseCaseDropdownPosition] = useState<'above' | 'below'>('below')
  const [locatedInDropdownPosition, setLocatedInDropdownPosition] = useState<'above' | 'below'>('below')
  const [sendingToDropdownPosition, setSendingToDropdownPosition] = useState<'above' | 'below'>('below')
  
  const primaryUseCaseRef = useRef<HTMLDivElement>(null)
  const locatedInRef = useRef<HTMLDivElement>(null)
  const sendingToRef = useRef<HTMLDivElement>(null)

  const handleInputChange = (field: keyof EarlyAccessFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const primaryUseCaseOptions = [
    { value: 'family-remittances', label: 'Family remittances' },
    { value: 'business-payments', label: 'Business payments' },
    { value: 'education-payments', label: 'Education payments' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'investment-portfolio', label: 'Investment/Portfolio management' },
    { value: 'api-integration', label: 'API integration' }
  ]

  const handlePrimaryUseCaseDropdownToggle = () => {
    if (!isPrimaryUseCaseDropdownOpen && primaryUseCaseRef.current) {
      const position = calculateDropdownPosition(primaryUseCaseRef.current)
      setPrimaryUseCaseDropdownPosition(position)
    }
    setIsPrimaryUseCaseDropdownOpen(!isPrimaryUseCaseDropdownOpen)
  }

  const calculateDropdownPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    const dropdownHeight = 200 // Approximate height of dropdown
    
    return spaceBelow < dropdownHeight && spaceAbove > spaceBelow ? 'above' : 'below'
  }

  const handleLocatedInDropdownToggle = () => {
    if (!isLocatedInDropdownOpen && locatedInRef.current) {
      const position = calculateDropdownPosition(locatedInRef.current)
      setLocatedInDropdownPosition(position)
    }
    setIsLocatedInDropdownOpen(!isLocatedInDropdownOpen)
    if (isLocatedInDropdownOpen) {
      setCountrySearch("")
    }
  }

  const handleSendingToDropdownToggle = () => {
    if (!isSendingToDropdownOpen && sendingToRef.current) {
      const position = calculateDropdownPosition(sendingToRef.current)
      setSendingToDropdownPosition(position)
    }
    setIsSendingToDropdownOpen(!isSendingToDropdownOpen)
    if (isSendingToDropdownOpen) {
      setCountrySearch("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit early access request")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter countries based on search
  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      
      // Close Primary Use Case dropdown
      if (isPrimaryUseCaseDropdownOpen && primaryUseCaseRef.current && !primaryUseCaseRef.current.contains(target)) {
        setIsPrimaryUseCaseDropdownOpen(false)
      }
      
      // Close Located In dropdown
      if (isLocatedInDropdownOpen && locatedInRef.current && !locatedInRef.current.contains(target)) {
        setIsLocatedInDropdownOpen(false)
        setCountrySearch("")
      }
      
      // Close Sending To dropdown
      if (isSendingToDropdownOpen && sendingToRef.current && !sendingToRef.current.contains(target)) {
        setIsSendingToDropdownOpen(false)
        setCountrySearch("")
      }
    }

    // Only add listener if any dropdown is open
    if (isPrimaryUseCaseDropdownOpen || isLocatedInDropdownOpen || isSendingToDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPrimaryUseCaseDropdownOpen, isLocatedInDropdownOpen, isSendingToDropdownOpen])

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h3>
          <p className="text-gray-600 mb-2">We've received your early access request. We'll review your application and send you an invitation to join Easner soon.</p>
          <p className="text-sm text-gray-500 mb-6">You'll receive an email at <strong>{formData.email}</strong> with next steps.</p>
          <Link href="/">
            <Button className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-900">Get Early Access</CardTitle>
        <CardDescription className="text-gray-600">Join the waitlist to be among the first to experience zero-fee international money transfers.</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter your email"
              className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="Enter your full name"
              className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappTelegram" className="text-gray-700">WhatsApp/Telegram *</Label>
            <Input
              id="whatsappTelegram"
              type="text"
              value={formData.whatsappTelegram}
              onChange={(e) => handleInputChange("whatsappTelegram", e.target.value)}
              placeholder="+1234567890 or @username"
              className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primaryUseCase" className="text-gray-700">Primary Use Case *</Label>
            <div className="relative" ref={primaryUseCaseRef}>
              <button
                type="button"
                onClick={handlePrimaryUseCaseDropdownToggle}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-easner-primary focus:border-easner-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className={formData.primaryUseCase ? "text-gray-900" : "text-gray-500"}>
                  {formData.primaryUseCase ? primaryUseCaseOptions.find(option => option.value === formData.primaryUseCase)?.label : "Select your primary use case"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {isPrimaryUseCaseDropdownOpen && (
                <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-hidden ${
                  primaryUseCaseDropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}>
                  <div className="max-h-36 sm:max-h-48 overflow-y-auto overscroll-contain">
                    {primaryUseCaseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleInputChange("primaryUseCase", option.value)
                          setIsPrimaryUseCaseDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm"
                      >
                        <span className="text-gray-900">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locatedIn" className="text-gray-700">I'm located in *</Label>
            <div className="relative" ref={locatedInRef}>
              <button
                type="button"
                onClick={handleLocatedInDropdownToggle}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-easner-primary focus:border-easner-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className={formData.locatedIn ? "text-gray-900" : "text-gray-500"}>
                  {formData.locatedIn ? COUNTRIES.find(c => c.code === formData.locatedIn)?.name : "Select your country"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {isLocatedInDropdownOpen && (
                <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-hidden ${
                  locatedInDropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}>
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="pl-10 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="max-h-36 sm:max-h-48 overflow-y-auto overscroll-contain">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleInputChange("locatedIn", country.code)
                          setIsLocatedInDropdownOpen(false)
                          setCountrySearch("")
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 truncate">{country.name}</span>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{country.code}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sendingTo" className="text-gray-700">I'm sending to *</Label>
            <div className="relative" ref={sendingToRef}>
              <button
                type="button"
                onClick={handleSendingToDropdownToggle}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md bg-white text-left focus:outline-none focus:ring-2 focus:ring-easner-primary focus:border-easner-primary disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className={formData.sendingTo ? "text-gray-900" : "text-gray-500"}>
                  {formData.sendingTo ? COUNTRIES.find(c => c.code === formData.sendingTo)?.name : "Select destination country"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {isSendingToDropdownOpen && (
                <div className={`absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 sm:max-h-60 overflow-hidden ${
                  sendingToDropdownPosition === 'above' ? 'bottom-full mb-1' : 'top-full mt-1'
                }`}>
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search countries..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="pl-10 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="max-h-36 sm:max-h-48 overflow-y-auto overscroll-contain">
                    {filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleInputChange("sendingTo", country.code)
                          setIsSendingToDropdownOpen(false)
                          setCountrySearch("")
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 truncate">{country.name}</span>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{country.code}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              className="mt-1"
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-easner-primary hover:text-easner-primary-600 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-easner-primary hover:text-easner-primary-600 hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !acceptTerms}
            className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Request Early Access
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
