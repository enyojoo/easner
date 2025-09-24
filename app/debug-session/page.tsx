"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function DebugSessionPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log("Session check:", { session, error })
        setSession(session)
        
        if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error("Session check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", { event, session })
      setSession(session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const testAdminLogin = async () => {
    try {
      const response = await fetch("/api/debug/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: "admin@easner.com", 
          password: "your_password_here" 
        }),
      })
      
      const data = await response.json()
      console.log("Debug admin login result:", data)
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error("Debug admin login error:", error)
      alert("Error: " + error)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Current Session:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Current User:</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <button 
        onClick={testAdminLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Admin Login
      </button>
    </div>
  )
}
