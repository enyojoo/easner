"use client"

import { useRouter } from "next/router"
import { useState } from "react"

const RegisterPage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const handleRegister = async () => {
    // Registration logic here
    // Assume registration is successful

    // Check for pending send data
    const pendingSendData = sessionStorage.getItem("pendingSendData")
    if (pendingSendData) {
      sessionStorage.removeItem("pendingSendData")
      const data = JSON.parse(pendingSendData)
      const params = new URLSearchParams({
        sendCurrency: data.sendCurrency,
        receiveCurrency: data.receiveCurrency,
        sendAmount: data.sendAmount,
      })
      router.push(`/user/send?${params.toString()}`)
      return
    }

    // Existing redirect logic
    router.push("/user/dashboard")
  }

  return (
    <div>
      <h1>Register</h1>
      <form>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button onClick={handleRegister}>Register</button>
      </form>
    </div>
  )
}

export default RegisterPage
