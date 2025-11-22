"use client"

import { useState, useEffect, useRef } from "react"
import { UserDashboardLayout } from "@/components/layout/user-dashboard-layout"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, X, Search, Check, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
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
import { kycService, KYCSubmission } from "@/lib/kyc-service"
import { countryService, Country, getCountryFlag } from "@/lib/country-service"

export default function IdentityVerificationPage() {
  const { userProfile } = useAuth()
  const [submission, setSubmission] = useState<KYCSubmission | null>(null)
  const [loading, setLoading] = useState(true)
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedIdType, setSelectedIdType] = useState("")
  const [identityFile, setIdentityFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [countrySearch, setCountrySearch] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadCountries()
    loadSubmission()
  }, [userProfile?.id])

  const loadCountries = async () => {
    try {
      const data = await countryService.getAll()
      setCountries(data)
    } catch (error) {
      console.error("Error loading countries:", error)
    }
  }

  const loadSubmission = async () => {
    if (!userProfile?.id) return
    try {
      setLoading(true)
      const submissions = await kycService.getByUserId(userProfile.id)
      const identity = submissions.find(s => s.type === "identity")
      if (identity) {
        setSubmission(identity)
        setSelectedCountry(identity.country_code || "")
        setSelectedIdType(identity.id_type || "")
      }
    } catch (error) {
      console.error("Error loading submission:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (file: File) => {
    setUploadError(null)

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB")
      return
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPG, PNG, and PDF files are allowed")
      return
    }

    setIdentityFile(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setIdentityFile(null)
    setUploadError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async () => {
    if (!selectedCountry || !selectedIdType || !identityFile || !userProfile?.id) {
      setUploadError("Please fill in all fields and upload a file")
      return
    }

    // Don't allow if already in review or approved
    if (submission && submission.status !== "pending") {
      setUploadError("Your identity verification is already under review or approved. You cannot upload a new document.")
      return
    }

    setUploading(true)
    setUploadError(null)
    try {
      const newSubmission = await kycService.createIdentitySubmission(userProfile.id, {
        country_code: selectedCountry,
        id_type: selectedIdType,
        id_document_file: identityFile,
      })

      setSubmission(newSubmission)
      setIdentityFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error: any) {
      console.error("Error uploading identity document:", error)
      setUploadError(error.message || "Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

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

  const selectedCountryData = countries.find(c => c.code === selectedCountry)

  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white px-5 py-6 border-b">
          <div className="flex items-center gap-3">
            <Link href="/user/more/verification">
              <button className="p-1 -ml-1">
                <ArrowLeft className="h-6 w-6 text-gray-900" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Identity Verification</h1>
            {submission && (
              <div className="ml-auto">
                {getStatusBadge(submission.status)}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-6 max-w-2xl mx-auto">
          {submission ? (
            // Show record view if submission exists
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Identity Verification</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm text-gray-600">Country</Label>
                    <p className="text-base text-gray-900 mt-1">
                      {selectedCountryData ? (
                        <span className="flex items-center gap-2">
                          <span>{selectedCountryData.flag_emoji}</span>
                          <span>{selectedCountryData.name}</span>
                        </span>
                      ) : (
                        submission.country_code
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">ID Type</Label>
                    <p className="text-base text-gray-900 mt-1">
                      {submission.id_type ? getIdTypeLabel(submission.id_type) : "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Document</Label>
                    <p className="text-base text-gray-900 mt-1">
                      {submission.id_document_filename || "-"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(submission.status)}
                    </div>
                  </div>
                </div>
              </div>
              {submission.status === "pending" && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      Your submission is pending review. You can update it below.
                    </p>
                  </div>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Update Submission</h3>
                    {/* Form fields for update */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="hidden"
                        />

                        {uploadError && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-red-700 font-medium">Upload Error</p>
                                <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setUploadError(null)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        <div
                          onClick={handleUploadClick}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            isDragOver
                              ? "border-easner-primary bg-easner-primary-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {identityFile ? (
                            <div className="space-y-2">
                              <Check className="h-8 w-8 text-green-600 mx-auto" />
                              <p className="text-sm font-medium text-gray-900">{identityFile.name}</p>
                              <p className="text-xs text-gray-500">
                                {(identityFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveFile()
                                }}
                                className="mt-2"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                              <p className="text-sm text-gray-600">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 10MB)</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedCountry || !selectedIdType || !identityFile || uploading}
                        className="w-full"
                      >
                        {uploading ? "Updating..." : "Update Submission"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Show form view
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
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
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                />

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-red-700 font-medium">Upload Error</p>
                        <p className="text-xs text-red-600 mt-1">{uploadError}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadError(null)}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div
                  onClick={handleUploadClick}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragOver
                      ? "border-easner-primary bg-easner-primary-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {identityFile ? (
                    <div className="space-y-2">
                      <Check className="h-8 w-8 text-green-600 mx-auto" />
                      <p className="text-sm font-medium text-gray-900">{identityFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(identityFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFile()
                        }}
                        className="mt-2"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">JPG, PNG, or PDF (max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!selectedCountry || !selectedIdType || !identityFile || uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Submit"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}

