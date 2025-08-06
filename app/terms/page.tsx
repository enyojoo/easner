import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function TermsContent() {
  const searchParams = useSearchParams()
  // ... rest of the existing component logic
  return (
    <div>
      <h1>Terms and Conditions</h1>
      <p>These are the terms and conditions for using our service.</p>
    </div>
  )
}

export default function TermsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TermsContent />
    </Suspense>
  )
}
