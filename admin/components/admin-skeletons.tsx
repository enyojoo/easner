import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/**
 * Cold-load skeletons, Office's pattern (components/office-skeletons.tsx): layout-matched, shown only on the first
 * load when the cache has nothing. Lists keep their last rows while they refetch.
 */

/** Posts list: 56px rows, cover thumb + title/slug, then text columns. */
export function PostsTableSkeleton({ rows = 6, columns }: { rows?: number; columns: string[] }) {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((name) => (
              <TableHead key={name}>{name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="h-14 hover:bg-transparent">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-16 shrink-0 rounded-md" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48 max-w-full" />
                    <Skeleton className="h-3 w-32 max-w-full" />
                  </div>
                </div>
              </TableCell>
              {Array.from({ length: columns.length - 1 }).map((__, cell) => (
                <TableCell key={cell}>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** Simple text rows (categories, team). */
export function SimpleTableSkeleton({ rows = 5, columns, label }: { rows?: number; columns: string[]; label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((name) => (
              <TableHead key={name}>{name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className="h-14 hover:bg-transparent">
              {columns.map((name, cell) => (
                <TableCell key={name}>
                  <Skeleton className={cell === 0 ? "h-4 w-40" : "h-4 w-24"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
