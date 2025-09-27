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
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { validatePassword } from "@/lib/security-settings"

function RegisterPageContent() {
  const router = useRouter()
  const { signUp, signIn } = useAuth()
  const { isChecking } = useRouteProtection({ requireAuth: false })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Show loading spinner while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-easner-primary mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation

    // Validate password using security settings
    const passwordValidation = await validatePassword(formData.password)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Invalid password")
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        baseCurrency: "USD", // Default base currency
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setSuccess(true)
      // Redirect after a short delay to show success message
      setTimeout(() => {
        // Redirect to login page after successful signup
        router.push("/auth/user/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-easner-primary-50 via-white to-blue-50">
        <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
          <div className="mb-8">
            <Link href="/">
              <BrandLogo size="md" />
            </Link>
          </div>
          <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h3>
              <p className="text-gray-600 mb-2">Welcome to Easner! Please check your email to verify your account.</p>
              <p className="text-sm text-gray-500 mb-4">After verification, you can sign in to start sending money.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
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
            <CardTitle className="text-2xl text-gray-900">Create account</CardTitle>
            <CardDescription className="text-gray-600">Join Easner and start sending money instantly</CardDescription>
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
                <Label htmlFor="firstName" className="text-gray-700">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary"
                  required
                  disabled={loading}
                />
              </div>


              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="border-gray-200 focus:border-easner-primary focus:ring-easner-primary pr-10"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>


              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  className="mt-1"
                  disabled={loading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-easner-primary hover:text-easner-primary-600 hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-easner-primary hover:text-easner-primary-600 hover:underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={loading || !acceptTerms}
                className="w-full bg-easner-primary hover:bg-easner-primary-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/auth/user/login"
                  className="text-easner-primary hover:text-easner-primary-600 hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function RegisterPage() {
  return <RegisterPageContent />
}
