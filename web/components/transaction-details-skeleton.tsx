"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TransactionDetailsSkeleton() {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-48" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            {/* Transaction ID */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>

            {/* Status Steps */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="flex items-start gap-4">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

