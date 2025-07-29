"use client"

import { useRouter } from "next/router"
import { useEffect } from "react"

const LoginPage = () => {
  const router = useRouter()
  const isAdmin = false // Example condition, replace with actual logic

  useEffect(() => {
    // Simulate login success
    const loginSuccess = true

    if (loginSuccess) {
      // Check for pending send data
      const pendingSendData = sessionStorage.getItem("pendingSendData")
      if (pendingSendData) {
        sessionStorage.removeItem("pendingSendData")
        const data = JSON.parse(pendingSendData)
        const params = new URLSearchParams({
          sendCurrency: data.sendCurrency,
          receiveCurrency: data.receiveCurrency,
          sendAmount: data.sendAmount,
          step: data.step.toString(),
        })
        router.push(`/user/send?${params.toString()}`)
        return
      }

      // Existing redirect logic
      if (isAdmin) {
        router.push("/admin/dashboard")
      } else {
        router.push("/user/dashboard")
      }
    }
  }, [router])

  return <div>{/* Login form here */}</div>
}

export default LoginPage
