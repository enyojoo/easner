"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_URLS } from "@easner/shared"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { useRouteProtection } from "@/hooks/use-route-protection"
import { getSecuritySettings, validatePassword } from "@/lib/security-settings"

function RegisterPageContent() {
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()
  useRouteProtection({ requireAuth: false })
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Use security settings for password validation
    const passwordValidation = validatePassword(formData.password, securitySettings?.passwordMinLength)
    if (!passwordValidation.valid) {
      setError(passwordValidation.error || "Password validation failed")
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
        router.push("/auth/login")
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
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Account Created Successfully!</h3>
          <p className="text-muted-foreground mb-2 text-sm sm:text-base">Welcome to Easner! Please check your email to verify your account.</p>
          <p className="text-sm text-muted-foreground mb-4">After verification, you can sign in to start sending money.</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">Create an Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            By creating an account you agree to our{" "}
            <a href={`${APP_URLS.website}/terms?from=register`} target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:underline">
              Terms
            </a>
            .
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full h-10 sm:h-11"
            onClick={async () => {
              const { error: err } = await signInWithGoogle()
              if (err) setError(err.message)
            }}
            disabled={loading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  className="h-10 sm:h-11"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  className="h-10 sm:h-11"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="h-10 sm:h-11"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="h-10 sm:h-11 pr-10"
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-medium hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function RegisterPage() {
  return <RegisterPageContent />
}
