"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { getSecuritySettings, validatePassword } from "@/lib/security-settings"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isValidSession, setIsValidSession] = useState(false)
  const [securitySettings, setSecuritySettings] = useState<any>(null)

  // Load security settings
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getSecuritySettings()
        setSecuritySettings(settings)
      } catch (error) {
        console.error("Error loading security settings:", error)
      }
    }
    loadSecuritySettings()
  }, [])

  useEffect(() => {
    // Check for reset token from session storage or URL params
    const resetToken = sessionStorage.getItem("reset-token") || searchParams.get("token")
    const resetEmail = sessionStorage.getItem("reset-email") || searchParams.get("email")

    if (!resetToken || !resetEmail) {
      setError("Invalid or expired reset link. Please request a new password reset.")
      return
    }

    setIsValidSession(true)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Use security settings for password validation
    const passwordValidation = validatePassword(passwords.newPassword, securitySettings?.passwordMinLength)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Password validation failed")
      setIsLoading(false)
      return
    }

    try {
      const resetToken = sessionStorage.getItem("reset-token")
      const resetEmail = sessionStorage.getItem("reset-email")

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          email: resetEmail,
          newPassword: passwords.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Clear session storage
        sessionStorage.removeItem("reset-token")
        sessionStorage.removeItem("reset-email")

        // Redirect to login with success message
        router.push("/auth/user/login?message=Password reset successful. Please sign in with your new password.")
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidSession && !error) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-5">
            <Link href="/">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-base text-gray-500">Enter your new password below</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isValidSession && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-base font-semibold text-gray-700">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary pr-12 text-base"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary pr-12 text-base"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-easner-primary hover:bg-easner-primary-600 text-white text-base font-semibold rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <Link
              href="/auth/user/login"
              className="inline-flex items-center gap-2 text-sm text-easner-primary hover:text-easner-primary-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={null}
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
