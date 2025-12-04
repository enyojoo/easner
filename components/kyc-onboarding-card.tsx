"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { FileText, Loader2, X } from "lucide-react"

interface KycOnboardingCardProps {
  onComplete?: () => void
}

export function KycOnboardingCard({ onComplete }: KycOnboardingCardProps) {
  const { userProfile } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [kycLink, setKycLink] = useState<string | null>(null)
  const [tosLink, setTosLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFlow, setCurrentFlow] = useState<"kyc" | "tos" | null>(null)
  const [kycCompleted, setKycCompleted] = useState(false)
  const [tosCompleted, setTosCompleted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Listen for postMessage events from Bridge iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (adjust to Bridge's domain)
      if (!event.origin.includes("bridge.xyz") && !event.origin.includes("withpersona.com")) {
        return
      }

      console.log("[KYC-CARD] Received postMessage:", event.data)

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data

        // Handle KYC completion - check various possible event formats
        if (
          data.type === "kyc.completed" ||
          data.event_type === "kyc_link.updated.status_transitioned" ||
          data.kyc_status === "approved" ||
          data.status === "approved"
        ) {
          console.log("[KYC-CARD] KYC completed")
          setKycCompleted(true)
          if (tosCompleted) {
            handleBothCompleted()
          } else if (tosLink) {
            // Switch to TOS flow
            setCurrentFlow("tos")
          }
        }

        // Handle TOS completion - check various possible event formats
        if (
          data.type === "tos.completed" ||
          data.event_type === "customer.updated" ||
          data.tos_status === "approved" ||
          data.has_accepted_terms_of_service === true ||
          data.signedAgreementId ||
          data.signed_agreement_id
        ) {
          console.log("[KYC-CARD] TOS completed")
          setTosCompleted(true)
          if (kycCompleted) {
            handleBothCompleted()
          } else if (kycLink) {
            // Switch to KYC flow
            setCurrentFlow("kyc")
          }
        }
      } catch (err) {
        console.error("[KYC-CARD] Error parsing postMessage:", err)
      }
    }

    if (showModal) {
      window.addEventListener("message", handleMessage)
      return () => window.removeEventListener("message", handleMessage)
    }
  }, [showModal, kycCompleted, tosCompleted, kycLink, tosLink])

  const handleBothCompleted = () => {
    console.log("[KYC-CARD] Both KYC and TOS completed")
    // Small delay to show completion state
    setTimeout(() => {
      setShowModal(false)
      setCurrentFlow(null)
      if (onComplete) {
        onComplete()
      }
    }, 1000)
  }

  const handleOpenModal = async () => {
    if (!userProfile) {
      setError("User profile not found")
      return
    }

    setLoading(true)
    setError(null)
    setShowModal(true)

    try {
      const fullName = `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim()
      const email = userProfile.email || ""

      if (!fullName || !email) {
        throw new Error("Full name and email are required")
      }

      const response = await fetch("/api/bridge/kyc-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          type: "individual",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create KYC link")
      }

      const data = await response.json()
      setKycLink(data.kyc_link)
      setTosLink(data.tos_link)
      setKycCompleted(data.kyc_status === "approved")
      setTosCompleted(data.tos_status === "approved")

      // Start with KYC flow if not completed, otherwise TOS
      if (data.kyc_status !== "approved" && data.kyc_status !== "complete") {
        setCurrentFlow("kyc")
      } else if (data.tos_status !== "approved" && data.tos_status !== "complete") {
        setCurrentFlow("tos")
      } else {
        // Both already completed
        console.log("[KYC-CARD] Both KYC and TOS already completed")
        handleBothCompleted()
        return
      }
    } catch (err: any) {
      console.error("[KYC-CARD] Error creating KYC link:", err)
      setError(err.message || "Failed to start KYC process")
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  const getIframeUrl = (link: string): string => {
    // Replace /verify with /widget and add iframe-origin parameter
    const widgetUrl = link.replace("/verify", "/widget")
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const separator = widgetUrl.includes("?") ? "&" : "?"
    return `${widgetUrl}${separator}iframe-origin=${encodeURIComponent(origin)}`
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentFlow(null)
    setKycLink(null)
    setTosLink(null)
  }

  return (
    <>
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {/* Icon on top */}
              <div className="w-12 h-12 rounded-full bg-easner-primary-100 flex items-center justify-center mb-3">
                <FileText className="h-5 w-5 text-easner-primary" />
              </div>
              {/* Title below icon */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">Bridge KYC Onboarding</h3>
              {/* Description below title */}
              <p className="text-sm text-gray-600 leading-relaxed">
                Complete your KYC verification and accept Terms of Service.
              </p>
            </div>
            {/* Status Badge and Arrow on the right */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {kycCompleted && tosCompleted ? (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Completed
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Start
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleOpenModal}
            disabled={loading}
            className="w-full mt-4 bg-easner-primary hover:bg-easner-primary-600"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Start KYC"
            )}
          </Button>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* KYC/TOS Modal with iframe */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle>
                {currentFlow === "kyc" ? "KYC Verification" : currentFlow === "tos" ? "Terms of Service" : "Onboarding"}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-easner-primary" />
              </div>
            )}
            {currentFlow === "kyc" && kycLink && (
              <iframe
                ref={iframeRef}
                src={getIframeUrl(kycLink)}
                className="w-full h-full border-0"
                allow="camera;"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
                title="KYC Verification"
              />
            )}
            {currentFlow === "tos" && tosLink && (
              <iframe
                ref={iframeRef}
                src={getIframeUrl(tosLink)}
                className="w-full h-full border-0"
                allow="camera;"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-top-navigation-by-user-activation"
                title="Terms of Service"
              />
            )}
            {!currentFlow && !loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

