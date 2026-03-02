"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function RecipientsSkeleton() {
  return (
    <div className="space-y-0">
      {/* Header Skeleton */}
      <div className="bg-white p-5 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="p-5 sm:p-6 pb-3 sm:pb-4">
        <Skeleton className="h-12 w-full rounded-md" />
      </div>

      {/* Recipients List Skeleton */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-5">
              {/* Recipient Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>

              {/* Account Details */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 sm:pt-4 border-t border-gray-100">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

