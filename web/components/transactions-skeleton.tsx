"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TransactionsSkeleton() {
  return (
    <div className="space-y-0">
      {/* Header Skeleton */}
      <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-5 sm:p-6 pb-3 sm:pb-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      {/* Transactions List Skeleton */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-5">
              {/* Transaction Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>

              {/* Recipient Info */}
              <div className="mb-4 sm:mb-5">
                <Skeleton className="h-3 w-8 mb-2" />
                <Skeleton className="h-5 w-48" />
              </div>

              {/* Amount Section */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

