"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useEffect } from "react"

function LoginPageContent() {
  const router = useRouter()
  const { signIn, user, userProfile, isAdmin, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState("")

  // Redirect if user is already logged in
  useEffect(() => {
    if (!loading && user && userProfile !== undefined) {
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [user, userProfile, isAdmin, loading, router])

  // Show loading only while auth is loading, not for form submission
  if (loading) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn(email, password, rememberMe)

      if (signInError) {
        setError(signInError.message)
        return
      }

      // Check for stored redirect and conversion data
      const redirectPath = sessionStorage.getItem("redirectAfterLogin")
      const conversionData = sessionStorage.getItem("conversionData")

      if (redirectPath && conversionData) {
        // Clear stored data
        sessionStorage.removeItem("redirectAfterLogin")
        sessionStorage.removeItem("conversionData")

        // Parse conversion data and add to URL
        const data = JSON.parse(conversionData)
        const params = new URLSearchParams({
          sendAmount: data.sendAmount,
          sendCurrency: data.sendCurrency,
          receiveCurrency: data.receiveCurrency,
          receiveAmount: data.receiveAmount.toString(),
          exchangeRate: data.exchangeRate.toString(),
          fee: data.fee.toString(),
          step: "2",
        })

        router.push(`/user/send?${params.toString()}`)
      } else {
        // Regular users always go to user dashboard
        router.push("/user/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-easner-primary-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your Easner account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary pr-10"
                    required
                    disabled={formLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={formLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={formLoading}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/user/forgot-password"
                  className="text-sm text-easner-primary hover:text-easner-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={formLoading}
                className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {formLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link
                  href="/auth/user/register"
                  className="text-easner-primary hover:text-easner-primary-600 hover:underline font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}
