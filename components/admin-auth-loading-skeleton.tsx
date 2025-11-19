import { Skeleton } from "@/components/ui/skeleton"

export function AdminAuthLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" /> {/* Logo placeholder */}
          <Skeleton className="h-8 w-64 mx-auto" /> {/* Title placeholder */}
          <Skeleton className="h-6 w-80 mx-auto" /> {/* Subtitle placeholder */}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" /> {/* Input 1 */}
          <Skeleton className="h-12 w-full" /> {/* Input 2 */}
          <Skeleton className="h-10 w-full" /> {/* Checkbox/link area */}
          <Skeleton className="h-12 w-full" /> {/* Button */}
        </div>
      </div>
    </div>
  )
}

