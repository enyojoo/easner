"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SendPageSkeleton() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Section */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>

            {/* Currency Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            </div>

            {/* Exchange Rate */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <Skeleton className="h-5 w-48 mx-auto" />
            </div>

            {/* Continue Button */}
            <Skeleton className="h-12 w-full rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

