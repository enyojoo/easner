"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BrandLogo } from "@/components/brand/brand-logo"
import { ArrowLeft, Mail } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
      } else {
        setError(data.error || "An error occurred")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-novapay-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <BrandLogo size="lg" className="mx-auto mb-4" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-novapay-primary" />
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we'll send you instructions to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-novapay-primary hover:bg-novapay-primary-600"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-center text-sm">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-novapay-primary hover:text-novapay-primary-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
              <div className="text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-novapay-primary hover:text-novapay-primary-600 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
