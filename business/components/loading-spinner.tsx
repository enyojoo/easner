export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse"></div>
          
          {/* Content skeleton */}
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-2/3 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          </div>
          
          {/* Card skeleton */}
          <div className="border rounded-lg p-6 space-y-4">
            <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
