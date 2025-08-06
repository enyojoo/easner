import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function PrivacyContent() {
  const searchParams = useSearchParams()
  // ... rest of the existing component logic
  return (
    <div>
      <h1>Privacy Policy</h1>
      <p>This is the privacy policy page.</p>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrivacyContent />
    </Suspense>
  )
}
