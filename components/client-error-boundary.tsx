"use client"

import dynamic from "next/dynamic"
import { Suspense, useEffect, useState } from "react"

// Dynamically import ErrorBoundary to avoid SSR issues
const ErrorBoundary = dynamic(() => import("./error-boundary"), {
  ssr: false,
  loading: () => null
})

interface ClientErrorBoundaryProps {
  children: React.ReactNode
}

export function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return (
    <Suspense fallback={null}>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    </Suspense>
  )
}
