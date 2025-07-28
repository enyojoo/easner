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
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error: signInError } = await signIn(email, password)

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
        // Check if user is admin by email (temporary check)
        if (email === "admin@novapay.com") {
          router.push("/admin/dashboard")
        } else {
          router.push("/user/dashboard")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-novapay-primary-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8">
          <BrandLogo size="md" />
        </div>

        <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">Sign in to your Novapay account</CardDescription>
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
                  className="border-gray-200 focus:border-novapay-primary focus:ring-novapay-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="border-gray-200 focus:border-novapay-primary focus:ring-novapay-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-novapay-primary hover:text-novapay-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-novapay-primary hover:bg-novapay-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {"Don't have an account? "}
                <Link
                  href="/register"
                  className="text-novapay-primary hover:text-novapay-primary-600 hover:underline font-medium"
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
