"use client"

import type React from "react"
import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [isValidSession, setIsValidSession] = useState(() => {
    if (typeof window === "undefined") return false
    const token = searchParams.get("token") || sessionStorage.getItem("reset-token")
    const email = searchParams.get("email") || sessionStorage.getItem("reset-email")
    return !!(token && email)
  })
  const [error, setError] = useState(() => {
    if (typeof window === "undefined") return ""
    const token = searchParams.get("token") || sessionStorage.getItem("reset-token")
    const email = searchParams.get("email") || sessionStorage.getItem("reset-email")
    return !(token && email) ? "Invalid or expired reset link. Please request a new password reset." : ""
  })
  const [securitySettings, setSecuritySettings] = useState<any>(null)

  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getSecuritySettings()
        setSecuritySettings(settings)
      } catch (err) {
        console.error("Error loading security settings:", err)
      }
    }
    loadSecuritySettings()
  }, [])

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl sm:text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isValidSession && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="h-10 sm:h-11 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    disabled={isLoading}
                  >
                    {showPassword.new ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    className="h-10 sm:h-11 pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    disabled={isLoading}
                  >
                    {showPassword.confirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 sm:h-11" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/auth/user/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
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
