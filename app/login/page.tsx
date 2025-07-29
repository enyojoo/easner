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

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message || "Invalid email or password")
      } else {
        // Successful login - redirect will be handled by useEffect
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
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
            <CardDescription className="text-gray-600">
              {redirectParam === "send"
                ? "Sign in to continue with your money transfer"
                : "Sign in to your account to continue"}
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
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

            <Button
              type="submit"
              className="w-full h-12 bg-novapay-primary hover:bg-novapay-primary-600 text-white font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href={redirectParam ? `/register?redirect=${redirectParam}` : "/register"}
                className="font-medium text-novapay-primary hover:text-novapay-primary-600"
              >
                Sign up
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
