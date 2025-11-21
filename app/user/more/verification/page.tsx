"use client"

import { useState, useEffect, useRef } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, User, ChevronRight, Upload, X, Search, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getIdTypesForCountry, getIdTypeLabel } from "@/lib/country-id-types"
import { KYCSubmission } from "@/lib/kyc-service"
import { countryService, Country, getCountryFlag } from "@/lib/country-service"

export default function VerificationPage() {
  const { userProfile } = useAuth()
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  
  // Identity verification dialog
  const [identityDialogOpen, setIdentityDialogOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedIdType, setSelectedIdType] = useState("")
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [uploadingIdentity, setUploadingIdentity] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [isIdentityDragOver, setIsIdentityDragOver] = useState(false)
  const [identityUploadError, setIdentityUploadError] = useState<string | null>(null)
  const identityFileInputRef = useRef<HTMLInputElement>(null)
  
  // Address verification dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<"utility_bill" | "bank_statement" | "">("")
  const [addressFile, setAddressFile] = useState<File | null>(null)
  const [uploadingAddress, setUploadingAddress] = useState(false)
  const [isAddressDragOver, setIsAddressDragOver] = useState(false)
  const [addressUploadError, setAddressUploadError] = useState<string | null>(null)
  const addressFileInputRef = useRef<HTMLInputElement>(null)

  // Load countries and submissions
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await countryService.getAll()
        setCountries(countriesData)
      } catch (error) {
        console.error("Error loading countries:", error)
      }
    }
    
    loadCountries()
  }, [])

  useEffect(() => {
    if (!userProfile?.id) return
    
    const loadSubmissions = async () => {
      try {
        const response = await fetch("/api/kyc/submissions", {
          credentials: "include",
        })
        if (response.ok) {
          const data = await response.json()
          setSubmissions(data.submissions || [])
        }
      } catch (error) {
        console.error("Error loading submissions:", error)
      }
    }
    
    loadSubmissions()
  }, [userProfile?.id])

  const identitySubmission = submissions.find(s => s.type === "identity")
  const addressSubmission = submissions.find(s => s.type === "address")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Done
          </span>
        )
      case "in_review":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            In review
          </span>
        )
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Rejected
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Pending
          </span>
        )
    }
  }

  // Identity file upload handlers
  const handleIdentityFileSelect = (file: File) => {
    setIdentityUploadError(null)

    if (file.size > 10 * 1024 * 1024) {
      setIdentityUploadError("File size must be less than 10MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setIdentityUploadError("Only JPG, PNG, and PDF files are allowed")
      return
    }

    setIdentityFile(file)
  }

  const handleIdentityFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleIdentityFileSelect(file)
    }
  }

  const handleIdentityDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsIdentityDragOver(true)
  }

  const handleIdentityDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsIdentityDragOver(false)
  }

  const handleIdentityDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsIdentityDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleIdentityFileSelect(file)
    }
  }

  const handleIdentityUploadClick = () => {
    identityFileInputRef.current?.click()
  }

  const handleRemoveIdentityFile = () => {
    setIdentityFile(null)
    setIdentityUploadError(null)
    if (identityFileInputRef.current) {
      identityFileInputRef.current.value = ""
    }
  }

  const handleDismissIdentityError = () => {
    setIdentityUploadError(null)
  }

  const handleIdentityUpload = async () => {
    if (!selectedCountry || !selectedIdType || !identityFile || !userProfile?.id) {
      alert("Please select country, ID type, and upload a file")
      return
    }

    setUploadingIdentity(true)
    setIdentityUploadError(null)
    try {
      const formData = new FormData()
      formData.append("type", "identity")
      formData.append("country_code", selectedCountry)
      formData.append("id_type", selectedIdType)
      formData.append("file", identityFile)

      const response = await fetch("/api/kyc/submissions", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(prev => {
          const filtered = prev.filter(s => s.type !== "identity")
          return [data.submission, ...filtered]
        })
        setIdentityDialogOpen(false)
        setSelectedCountry("")
        setSelectedIdType("")
        setIdentityFile(null)
        setCountrySearch("")
        setIdentityUploadError(null)
      } else {
        const error = await response.json()
        setIdentityUploadError(error.error || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading identity document:", error)
      setIdentityUploadError("Failed to upload document")
    } finally {
      setUploadingIdentity(false)
    }
  }

  // Address file upload handlers
  const handleAddressFileSelect = (file: File) => {
    setAddressUploadError(null)

    if (file.size > 10 * 1024 * 1024) {
      setAddressUploadError("File size must be less than 10MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setAddressUploadError("Only JPG, PNG, and PDF files are allowed")
      return
    }

    setAddressFile(file)
  }

  const handleAddressFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAddressFileSelect(file)
    }
  }

  const handleAddressDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsAddressDragOver(true)
  }

  const handleAddressDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsAddressDragOver(false)
  }

  const handleAddressDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsAddressDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleAddressFileSelect(file)
    }
  }

  const handleAddressUploadClick = () => {
    addressFileInputRef.current?.click()
  }

  const handleRemoveAddressFile = () => {
    setAddressFile(null)
    setAddressUploadError(null)
    if (addressFileInputRef.current) {
      addressFileInputRef.current.value = ""
    }
  }

  const handleDismissAddressError = () => {
    setAddressUploadError(null)
  }

  const handleAddressUpload = async () => {
    if (!selectedDocumentType || !addressFile || !userProfile?.id) {
      alert("Please select document type and upload a file")
      return
    }

    setUploadingAddress(true)
    setAddressUploadError(null)
    try {
      const formData = new FormData()
      formData.append("type", "address")
      formData.append("document_type", selectedDocumentType)
      formData.append("file", addressFile)

      const response = await fetch("/api/kyc/submissions", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(prev => {
          const filtered = prev.filter(s => s.type !== "address")
          return [data.submission, ...filtered]
        })
        setAddressDialogOpen(false)
        setSelectedDocumentType("")
        setAddressFile(null)
        setAddressUploadError(null)
      } else {
        const error = await response.json()
        setAddressUploadError(error.error || "Failed to upload document")
      }
    } catch (error) {
      console.error("Error uploading address document:", error)
      setAddressUploadError("Failed to upload document")
    } finally {
      setUploadingAddress(false)
    }
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-1">
              <Link href="/user/more">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Account Verification</h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-6 lg:px-8 space-y-4">
          {/* Identity Verification Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIdentityDialogOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Identity verification</h3>
                    <p className="text-sm text-gray-600">
                      Your ID document and ID verification information.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(identitySubmission?.status || "pending")}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information Card */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setAddressDialogOpen(true)}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Address information</h3>
                    <p className="text-sm text-gray-600">
                      Your home address and utility bill document.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(addressSubmission?.status || "pending")}
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Identity Verification Dialog */}
        <Dialog open={identityDialogOpen} onOpenChange={(open) => {
          setIdentityDialogOpen(open)
          if (!open) {
            setCountrySearch("")
            setIdentityFile(null)
            setIdentityUploadError(null)
            setIsIdentityDragOver(false)
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Identity Verification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={selectedCountry} onValueChange={(value) => {
                  setSelectedCountry(value)
                  setCountrySearch("")
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="h-9 pl-9"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {countries
                        .filter((country) =>
                          country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                          country.code.toLowerCase().includes(countrySearch.toLowerCase())
                        )
                        .map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span className="text-lg">{country.flag_emoji}</span>
                              <span>{country.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      {countries.filter((country) =>
                        country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                        country.code.toLowerCase().includes(countrySearch.toLowerCase())
                      ).length === 0 && (
                        <div className="px-2 py-6 text-center text-sm text-gray-500">
                          No countries found
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && (
                <div className="space-y-2">
                  <Label>ID Type</Label>
                  <Select value={selectedIdType} onValueChange={setSelectedIdType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getIdTypesForCountry(selectedCountry).map((idType) => (
                        <SelectItem key={idType} value={idType}>
                          {getIdTypeLabel(idType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>ID Document</Label>
                <input
                  type="file"
                  ref={identityFileInputRef}
                  onChange={handleIdentityFileInputChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />

                {/* Upload Error Alert */}
                {identityUploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">Upload Error</p>
                        <p className="text-xs text-red-600 mt-1">{identityUploadError}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismissIdentityError}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  onClick={handleIdentityUploadClick}
                  onDragOver={handleIdentityDragOver}
                  onDragLeave={handleIdentityDragLeave}
                  onDrop={handleIdentityDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isIdentityDragOver
                      ? "border-easner-primary bg-easner-primary-50"
                      : identityFile
                        ? "border-green-300 bg-green-50"
                        : identityUploadError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-easner-primary-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        identityFile
                          ? "bg-green-100"
                          : identityUploadError
                            ? "bg-red-100"
                            : isIdentityDragOver
                              ? "bg-easner-primary-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {identityFile ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : identityUploadError ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Upload
                          className={`h-5 w-5 transition-colors ${
                            isIdentityDragOver ? "text-easner-primary" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {identityFile
                          ? identityFile.name
                          : identityUploadError
                            ? "Upload Failed"
                            : "Upload ID Document"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {identityFile
                          ? `${(identityFile.size / 1024 / 1024).toFixed(2)} MB`
                          : identityUploadError
                            ? "Click to try again"
                            : "JPG, PNG or PDF (Max 10MB)"}
                      </p>
                    </div>
                    {identityFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveIdentityFile()
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleIdentityUpload}
                disabled={!selectedCountry || !selectedIdType || !identityFile || uploadingIdentity}
                className="w-full bg-easner-primary hover:bg-easner-primary-600"
              >
                {uploadingIdentity ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Address Verification Dialog */}
        <Dialog open={addressDialogOpen} onOpenChange={(open) => {
          setAddressDialogOpen(open)
          if (!open) {
            setAddressFile(null)
            setAddressUploadError(null)
            setIsAddressDragOver(false)
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Address Verification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={selectedDocumentType} onValueChange={(value) => setSelectedDocumentType(value as "utility_bill" | "bank_statement")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utility_bill">Utility Bill</SelectItem>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Document</Label>
                <input
                  type="file"
                  ref={addressFileInputRef}
                  onChange={handleAddressFileInputChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />

                {/* Upload Error Alert */}
                {addressUploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">Upload Error</p>
                        <p className="text-xs text-red-600 mt-1">{addressUploadError}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismissAddressError}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  onClick={handleAddressUploadClick}
                  onDragOver={handleAddressDragOver}
                  onDragLeave={handleAddressDragLeave}
                  onDrop={handleAddressDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isAddressDragOver
                      ? "border-easner-primary bg-easner-primary-50"
                      : addressFile
                        ? "border-green-300 bg-green-50"
                        : addressUploadError
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-easner-primary-300"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        addressFile
                          ? "bg-green-100"
                          : addressUploadError
                            ? "bg-red-100"
                            : isAddressDragOver
                              ? "bg-easner-primary-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {addressFile ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : addressUploadError ? (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Upload
                          className={`h-5 w-5 transition-colors ${
                            isAddressDragOver ? "text-easner-primary" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {addressFile
                          ? addressFile.name
                          : addressUploadError
                            ? "Upload Failed"
                            : "Upload Address Document"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {addressFile
                          ? `${(addressFile.size / 1024 / 1024).toFixed(2)} MB`
                          : addressUploadError
                            ? "Click to try again"
                            : "JPG, PNG or PDF (Max 10MB)"}
                      </p>
                    </div>
                    {addressFile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveAddressFile()
                        }}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddressUpload}
                disabled={!selectedDocumentType || !addressFile || uploadingAddress}
                className="w-full bg-easner-primary hover:bg-easner-primary-600"
              >
                {uploadingAddress ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserDashboardLayout>
  )
}
