"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { getSecuritySettings, validatePassword } from "@/lib/security-settings"

function RegisterPageContent() {
  const router = useRouter()
  const { signUp, signIn } = useAuth()
  const { isChecking } = useRouteProtection({ requireAuth: false })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [securitySettings, setSecuritySettings] = useState<any>(null)

  // Load security settings on component mount
  React.useEffect(() => {
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

  // Show loading spinner while checking authentication
  if (isChecking) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Use security settings for password validation
    const passwordValidation = validatePassword(formData.password, securitySettings?.passwordMinLength)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Password validation failed")
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
      <div className="min-h-screen bg-white flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-md text-center">
          <div className="mb-5">
            <Link href="/">
              <BrandLogo size="lg" />
            </Link>
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Created Successfully!</h3>
          <p className="text-gray-600 mb-2">Welcome to Easner! Please check your email to verify your account.</p>
          <p className="text-sm text-gray-500 mb-4">After verification, you can sign in to start sending money.</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-base text-gray-500">To send money with Ease</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-base font-semibold text-gray-700">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary text-base"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-base font-semibold text-gray-700">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary text-base"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold text-gray-700">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary text-base"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-700">
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary pr-12 text-base"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base font-semibold text-gray-700">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="h-12 border-gray-300 focus:border-easner-primary focus:ring-easner-primary pr-12 text-base"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3">
              <button
                type="button"
                onClick={() => setAcceptTerms(!acceptTerms)}
                className="flex items-start space-x-3 pt-1"
                disabled={loading}
              >
                <div className={`w-5 h-5 border-2 rounded mt-0.5 ${acceptTerms ? 'bg-easner-primary border-easner-primary' : 'border-gray-300 bg-white'} flex items-center justify-center flex-shrink-0`}>
                  {acceptTerms && <span className="text-white text-xs">✓</span>}
                </div>
                <Label htmlFor="terms" className="text-sm text-gray-500 leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-easner-primary font-semibold hover:text-easner-primary-600">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-easner-primary font-semibold hover:text-easner-primary-600">
                    Privacy Policy
                  </Link>
                </Label>
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading || !acceptTerms}
              className="w-full h-12 bg-easner-primary hover:bg-easner-primary-600 text-white text-base font-semibold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/user/login"
              className="text-sm text-easner-primary font-semibold hover:text-easner-primary-600"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <RegisterPageContent />
}
