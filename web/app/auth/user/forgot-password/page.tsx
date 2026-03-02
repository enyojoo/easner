"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand/brand-logo"
import { BRAND } from "@/components/brand/brand-constants"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const router = useRouter()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep("otp")
        setMessage("We've sent a 6-digit code to your email address.")
        startResendCooldown()
      } else {
        setError(data.error || "An error occurred")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpCode = otp.join("")

    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store reset token and redirect to reset password page
        sessionStorage.setItem("reset-token", data.resetToken)
        sessionStorage.setItem("reset-email", email)
        router.push("/auth/user/reset-password")
      } else {
        setError(data.error || "Invalid code. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage("New code sent to your email address.")
        startResendCooldown()
      } else {
        setError("Failed to resend code. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const startResendCooldown = () => {
    setResendCooldown(60)
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-5 flex justify-center">
            <Link href={BRAND.url}>
              <BrandLogo size="lg" />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === "email" ? "Forgot Password" : "Enter Verification Code"}
          </h1>
          <p className="text-base text-gray-500">
            {step === "email"
              ? "Enter your email for verification code"
              : `We've sent a 6-digit code to ${email}`}
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary text-base"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-easner-primary hover:bg-easner-primary-600 text-white text-base font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-base font-semibold text-gray-700">Enter 6-digit code</Label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border-gray-300 focus:border-easner-primary focus:ring-easner-primary"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-easner-primary hover:bg-easner-primary-600 text-white text-base font-semibold rounded-lg"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-easner-primary hover:text-easner-primary-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => {
                if (step === "otp") {
                  setStep("email")
                  setOtp(["", "", "", "", "", ""])
                  setError("")
                  setMessage("")
                } else {
                  router.push("/auth/user/login")
                }
              }}
              className="inline-flex items-center justify-center gap-2 text-sm text-easner-primary hover:text-easner-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === "otp" ? "Change Email" : "Back to Sign In"}
            </button>
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/auth/user/register"
                className="text-sm text-easner-primary font-semibold hover:text-easner-primary-600"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
