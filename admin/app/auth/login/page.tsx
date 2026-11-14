"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { BrandLogo } from "@easner/shared"
import { AuthCard } from "@/components/auth/auth-card"
import { OtpInput } from "@/components/auth/otp-input"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { ADMIN_HOME } from "@/lib/nav-config"
import { supabase } from "@/lib/supabase"

/**
 * Sign-in (OffAuth, admin variant): email → 6-digit email code → authenticator (set up once, then a code every
 * sign-in). Membership comes from the admin_members allowlist; anyone else sees "No access".
 */

type EmailStep = "email" | "code"
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const FACTOR_NAME = "Easner Blog Admin"

type Enrollment = { factorId: string; qrCode: string; secret: string }

function authErrorText(error: { message?: string; status?: number; code?: string } | null, fallback: string): string {
  if (!error) return fallback
  if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
    return "Too many attempts. Wait a minute, then try again."
  }
  if (error.code === "otp_expired" || /expired|invalid/i.test(error.message ?? "")) {
    return "That code didn’t work. Check it, or send a new one."
  }
  return fallback
}

export default function LoginPage() {
  const router = useRouter()
  const { user, access, hasVerifiedFactor, refresh, signOut } = useAuth()
  const [emailStep, setEmailStep] = useState<EmailStep>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const enrolling = useRef(false)
  const verifying = useRef(false)

  const needsMfa = access === "needs-mfa"
  const mfaStep: "enroll" | "verify" | null = needsMfa ? (hasVerifiedFactor ? "verify" : "enroll") : null

  useEffect(() => {
    if (access === "ready") router.replace(ADMIN_HOME)
  }, [access, router])

  // First sign-in: create the authenticator factor and show its QR code. Abandoned set-ups are cleared first.
  useEffect(() => {
    if (mfaStep !== "enroll" || enrollment || enrolling.current) return
    enrolling.current = true
    void (async () => {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      for (const factor of factors?.all ?? []) {
        if (factor.factor_type === "totp" && factor.status !== "verified") {
          await supabase.auth.mfa.unenroll({ factorId: factor.id })
        }
      }
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: FACTOR_NAME })
      enrolling.current = false
      if (enrollError || !data) {
        setError("Couldn’t start the authenticator set-up. Reload the page to try again.")
        return
      }
      setEnrollment({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret })
    })()
  }, [mfaStep, enrollment])

  const sendCode = async () => {
    const normalized = email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(normalized)) {
      setError("Enter your work email.")
      return
    }
    setBusy(true)
    setError("")
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: true },
    })
    setBusy(false)
    // An email with no invite is refused by the signup hook. Say the same thing either way, so this form can't be
    // used to find out who is on the team; only a rate limit is named.
    if (otpError) {
      const refusedByHook = otpError.status === 400 || otpError.status === 403 || otpError.status === 422
      const rateLimited = otpError.status === 429 || /rate limit/i.test(otpError.message)
      if (rateLimited || !refusedByHook) {
        setError(rateLimited ? authErrorText(otpError, "") : "Couldn’t reach the sign-in service. Check your connection and try again.")
        return
      }
    }
    setEmail(normalized)
    setCode("")
    setEmailStep("code")
  }

  const verifyEmailCode = useCallback(
    async (digits: string) => {
      if (verifying.current) return
      verifying.current = true
      setBusy(true)
      setError("")
      const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: digits, type: "email" })
      if (verifyError) {
        verifying.current = false
        setBusy(false)
        setCode("")
        setError(authErrorText(verifyError, "That code didn’t work. Check it, or send a new one."))
        return
      }
      await refresh()
      verifying.current = false
      setBusy(false)
      setCode("")
    },
    [email, refresh],
  )

  const verifyAuthenticator = useCallback(
    async (digits: string) => {
      if (verifying.current) return
      let factorId = enrollment?.factorId ?? null
      if (!factorId) {
        const { data } = await supabase.auth.mfa.listFactors()
        factorId = data?.totp.find((factor) => factor.status === "verified")?.id ?? null
      }
      if (!factorId) {
        setError("Couldn’t find your authenticator. Reload the page to try again.")
        return
      }
      verifying.current = true
      setBusy(true)
      setError("")
      const { error: mfaError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: digits })
      if (mfaError) {
        verifying.current = false
        setBusy(false)
        setCode("")
        setError(authErrorText(mfaError, "That code didn’t work. Use the newest code from your authenticator app."))
        return
      }
      const next = await refresh()
      verifying.current = false
      setBusy(false)
      if (next === "ready") router.replace(ADMIN_HOME)
    },
    [enrollment, refresh, router],
  )

  const onCodeChange = (digits: string) => {
    setCode(digits)
    if (error) setError("")
    if (digits.length !== 6) return
    if (mfaStep) void verifyAuthenticator(digits)
    else void verifyEmailCode(digits)
  }

  const startOver = async () => {
    await signOut()
    setEnrollment(null)
    setEmailStep("email")
    setCode("")
    setError("")
  }

  const page = (card: React.ReactNode) => (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-background px-6 py-12">
      <BrandLogo size="lg" className="h-8 w-auto" />
      {card}
    </main>
  )

  // Hold a blank frame while the session resolves or the shell opens: never flash the form.
  if (access === "loading" || access === "ready") return page(null)

  if (access === "no-access") {
    return page(
      <AuthCard
        title="No access"
        description={
          <>
            You’re signed in as <span className="text-foreground">{user?.email}</span>, but this email isn’t on the
            Easner Blog Admin team.
          </>
        }
      >
        <p className="text-center text-sm text-muted-foreground">Ask an owner to invite you, then sign in again.</p>
        <Button type="button" variant="outline" size="lg" className="w-full" onClick={() => void startOver()}>
          Sign out
        </Button>
      </AuthCard>,
    )
  }

  const codeError = (
    <div id="admin-code-error" role="alert" className="min-h-5 text-center text-xs text-destructive-text">
      {error}
    </div>
  )

  if (mfaStep === "enroll") {
    return page(
      <AuthCard
        title="Set up your authenticator"
        description="Scan the code with an authenticator app (1Password, Google Authenticator, Authy), then enter the 6-digit code it shows."
      >
        {enrollment ? (
          <div className="grid gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- an SVG data URL from Supabase Auth */}
            <img src={enrollment.qrCode} alt="QR code for your authenticator app" className="mx-auto size-44 rounded-md bg-card" />
            <p className="text-center text-xs text-muted-foreground">Can’t scan it? Enter this key instead:</p>
            <p className="break-all rounded-md border border-border bg-muted px-3.5 py-3 text-center font-mono text-[13px]">
              {enrollment.secret}
            </p>
          </div>
        ) : (
          <div className="mx-auto size-44 animate-pulse rounded-md bg-muted" aria-busy="true" aria-label="Preparing" />
        )}
        <OtpInput
          ariaLabel="Authenticator code"
          value={code}
          onChange={onCodeChange}
          disabled={busy || !enrollment}
          invalid={Boolean(error)}
          describedBy="admin-code-error"
        />
        {codeError}
        <Button type="button" variant="ghost" className="w-full" onClick={() => void startOver()}>
          Use a different email
        </Button>
      </AuthCard>,
    )
  }

  if (mfaStep === "verify") {
    return page(
      <AuthCard title="Enter your authenticator code" description="Open your authenticator app and enter the 6-digit code for Easner Blog Admin.">
        <OtpInput
          ariaLabel="Authenticator code"
          value={code}
          onChange={onCodeChange}
          disabled={busy}
          invalid={Boolean(error)}
          describedBy="admin-code-error"
          autoFocus
        />
        {codeError}
        <Button type="button" variant="ghost" className="w-full" onClick={() => void startOver()}>
          Use a different email
        </Button>
      </AuthCard>,
    )
  }

  if (emailStep === "code") {
    return page(
      <AuthCard
        title="Check your email"
        description={
          <>
            If <span className="text-foreground">{email}</span> has access, we sent it a 6-digit code. It expires in 10
            minutes.
          </>
        }
      >
        <OtpInput
          ariaLabel="Email code"
          value={code}
          onChange={onCodeChange}
          disabled={busy}
          invalid={Boolean(error)}
          describedBy="admin-code-error"
          autoFocus
        />
        {codeError}
        <div className="grid gap-2">
          <Button type="button" variant="outline" className="w-full" disabled={busy} onClick={() => void sendCode()}>
            Send a new code
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setEmailStep("email")
              setCode("")
              setError("")
            }}
          >
            Use a different email
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">No code? Ask an owner to check you’re on the team.</p>
      </AuthCard>,
    )
  }

  return page(
    <AuthCard title="Sign in to Easner Blog Admin" description="The blog and website admin. We’ll email you a sign-in code.">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          void sendCode()
        }}
      >
        <Field label="Work email" error={error || undefined}>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
            required
            disabled={busy}
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" className="w-full" loading={busy} loadingLabel="Sending…">
          Email me a code
        </Button>
      </form>
    </AuthCard>,
  )
}
