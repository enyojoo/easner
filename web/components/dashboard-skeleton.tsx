"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 pb-5 sm:pb-6">
      {/* Page Header Skeleton */}
      <div className="bg-white p-5 sm:p-6 mb-5 sm:mb-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="px-5 sm:px-6 flex gap-3 sm:gap-6">
        <Card className="flex-[1.5] sm:flex-1">
          <CardContent className="p-5 sm:p-6 text-center">
            <Skeleton className="h-10 sm:h-12 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-5 sm:h-6 w-1/2 mx-auto" />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardContent className="p-5 sm:p-6 text-center">
            <Skeleton className="h-10 sm:h-12 w-1/2 mx-auto mb-2" />
            <Skeleton className="h-5 sm:h-6 w-2/3 mx-auto" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="px-5 sm:px-6 flex gap-3 sm:gap-6">
        <div className="flex-1">
          <Skeleton className="h-14 sm:h-16 w-full rounded-lg" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-14 sm:h-16 w-full rounded-lg" />
        </div>
      </div>

      {/* Recent Transactions Skeleton */}
      <div className="px-5 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Skeleton className="h-6 sm:h-7 w-40" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Transaction Items Skeleton */}
        <div className="space-y-4 sm:space-y-5">
          {[1, 2].map((index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-5">
                {/* Transaction Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* Recipient Section */}
                <div className="mb-4 sm:mb-5">
                  <Skeleton className="h-3 w-8 mb-2" />
                  <Skeleton className="h-5 w-2/3" />
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
    </div>
  )
}

