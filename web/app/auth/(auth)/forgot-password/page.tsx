"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
        router.push("/auth/reset-password")
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {step === "email" ? "Forgot Password" : "Enter Verification Code"}
        </CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email for verification code"
            : `We've sent a 6-digit code to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
            </div>
          )}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-11"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-digit code</Label>
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
                      className="w-10 h-10 sm:w-12 sm:h-12 text-center text-base sm:text-lg font-semibold"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-10 sm:h-11"
                disabled={isLoading || otp.join("").length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-sm text-primary hover:underline disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 flex flex-col gap-2 text-center">
            <button
              type="button"
              onClick={() => {
                if (step === "otp") {
                  setStep("email")
                  setOtp(["", "", "", "", "", ""])
                  setError("")
                  setMessage("")
                } else {
                  router.push("/auth/login")
                }
              }}
              className="inline-flex items-center justify-center gap-2 text-sm text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {step === "otp" ? "Change Email" : "Back to Sign In"}
            </button>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
