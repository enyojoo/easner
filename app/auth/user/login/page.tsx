"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { Eye, EyeOff } from "lucide-react"
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
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-5">
            <Link href="/">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-base text-gray-500">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary text-base"
                required
                disabled={formLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary pr-12 text-base"
                  required
                  disabled={formLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={formLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-3"
                disabled={formLoading}
              >
                <div className={`w-5 h-5 border-2 rounded ${rememberMe ? 'bg-easner-primary border-easner-primary' : 'border-gray-300 bg-white'} flex items-center justify-center`}>
                  {rememberMe && <span className="text-white text-xs">✓</span>}
                </div>
                <Label htmlFor="remember" className="text-base font-medium text-gray-700 cursor-pointer">
                  Remember me
                </Label>
              </button>
            </div>

            <Button
              type="submit"
              disabled={formLoading}
              className="w-full h-12 bg-easner-primary hover:bg-easner-primary-600 text-white text-base font-semibold rounded-lg"
            >
              {formLoading ? "Signing In..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/user/forgot-password"
                className="text-sm text-easner-primary hover:text-easner-primary-600"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/auth/user/register"
              className="text-sm text-easner-primary font-semibold hover:text-easner-primary-600"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <LoginPageContent />
}
