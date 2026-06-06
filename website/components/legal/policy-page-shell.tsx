import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export const POLICY_LAST_UPDATED = "June 6, 2026"

export function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-easner-primary hover:underline">
      {children}
    </Link>
  )
}

export function PolicyPageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main style={{ paddingTop: "4.5rem" }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card className="shadow-lg border-0 ring-1 ring-gray-100">
            <CardContent className="p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
              <div className="prose prose-lg max-w-none space-y-8">{children}</div>
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500">Last updated: {POLICY_LAST_UPDATED}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}

export function PolicyContactBlock() {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
      <p>
        <strong>Easner Group, Inc.</strong>
        <br />
        584 Castro St, Suite 4092
        <br />
        San Francisco, CA 94114, United States
        <br />
        <br />
        <strong>Email (legal and compliance):</strong>{" "}
        <a href="mailto:legal@easner.com" className="text-easner-primary hover:underline">
          legal@easner.com
        </a>
        <br />
        <strong>Email (support):</strong>{" "}
        <a href="mailto:support@easner.com" className="text-easner-primary hover:underline">
          support@easner.com
        </a>
        <br />
        <strong>Phone:</strong> +1 628 228 6083
        <br />
        <strong>In-app support:</strong> Live chat in the Easner mobile app and Business dashboard
        <br />
        <strong>Website:</strong> www.easner.com
      </p>
    </div>
  )
}

export function PolicyTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-200 text-sm text-gray-700">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((header) => (
              <th key={header} className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border border-gray-200 px-4 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
