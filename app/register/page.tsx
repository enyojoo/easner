"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BrandLogo } from "@/components/brand/brand-logo"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const SUPPORTED_CURRENCIES = [
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signUp, user, loading } = useAuth()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [baseCurrency, setBaseCurrency] = useState("NGN")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const redirectParam = searchParams.get("redirect")

  useEffect(() => {
    if (user && !loading) {
      // If user is already logged in, redirect appropriately
      if (redirectParam === "send") {
        router.push("/user/send")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [user, loading, router, redirectParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, {
        firstName,
        lastName,
        baseCurrency,
      })

      if (error) {
        setError(error.message || "Failed to create account")
      } else {
        // Account created successfully
        if (redirectParam === "send") {
          router.push("/user/send")
        } else {
          router.push("/user/dashboard")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedCurrency = SUPPORTED_CURRENCIES.find((c) => c.code === baseCurrency)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-novapay-primary-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-novapay-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-novapay-primary-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 ring-1 ring-gray-100">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <BrandLogo className="h-12" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create your account</CardTitle>
            <CardDescription className="text-gray-600">
              {redirectParam === "send"
                ? "Sign up to continue with your money transfer"
                : "Join thousands of users sending money globally"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseCurrency">Base Currency</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-12 justify-between bg-white border-gray-200 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{selectedCurrency?.symbol}</span>
                      <span>{selectedCurrency?.code}</span>
                      <span className="text-gray-500">- {selectedCurrency?.name}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() => setBaseCurrency(currency.code)}
                      className="flex items-center gap-3"
                    >
                      <span className="font-medium">{currency.symbol}</span>
                      <div>
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-sm text-muted-foreground">{currency.name}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-novapay-primary hover:bg-novapay-primary-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href={redirectParam ? `/login?redirect=${redirectParam}` : "/login"}
                className="font-medium text-novapay-primary hover:text-novapay-primary-600"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
