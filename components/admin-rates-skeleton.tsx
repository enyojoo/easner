import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function AdminRatesSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Currency Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exchange Rates Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

