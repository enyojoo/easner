"use client"

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Transaction } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  completed: "Completed",
  pending: "Pending",
  processing: "Processing",
  failed: "Failed",
}

const styles = StyleSheet.create({
  page: {
    padding: 0,
    paddingBottom: 48,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 24,
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 2,
  },
  headerLogo: {
    width: 200,
    height: 80,
    objectFit: "contain",
  },
  heroSection: {
    paddingHorizontal: 40,
    marginBottom: 24,
  },
  statusBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  amountBig: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  amountCredit: {
    color: "#16a34a",
  },
  amountDebit: {
    color: "#111827",
  },
  dateText: {
    fontSize: 10,
    color: "#6b7280",
  },
  tableWrapper: {
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowLast: {
    flexDirection: "row",
  },
  tableRowFirst: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableRowLastRounded: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  tableRowOdd: {
    backgroundColor: "#ffffff",
  },
  tableCell: {
    flex: 1,
    padding: 12,
    fontSize: 10,
    color: "#475569",
  },
  tableCellValue: {
    flex: 1.5,
    padding: 12,
    fontSize: 10,
    color: "#0f172a",
    textAlign: "right",
  },
  amountCellCredit: {
    flex: 1.5,
    padding: 12,
    fontSize: 10,
    color: "#16a34a",
    fontWeight: "bold",
    textAlign: "right",
  },
  amountCellDebit: {
    flex: 1.5,
    padding: 12,
    fontSize: 10,
    color: "#0f172a",
    fontWeight: "bold",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    alignItems: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 2,
  },
  footerTextLink: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },
  footerEmail: {
    fontSize: 9,
    color: "#007ACC",
    textAlign: "center",
  },
})

interface TransactionReceiptPDFDocumentProps {
  transaction: Transaction
  logoUrl: string
  cardLast4?: string
}

function TableRow({
  label,
  value,
  valueStyle,
  isFirst,
  isLast,
  rowStyle,
}: {
  label: string
  value: string
  valueStyle?: object
  isFirst?: boolean
  isLast?: boolean
  rowStyle?: object
}) {
  return (
    <View
      style={[
        isLast ? styles.tableRowLast : styles.tableRow,
        isFirst && styles.tableRowFirst,
        isLast && styles.tableRowLastRounded,
        rowStyle,
      ]}
    >
      <Text style={styles.tableCell}>{label}</Text>
      <Text style={valueStyle ?? styles.tableCellValue}>{value}</Text>
    </View>
  )
}

export function TransactionReceiptPDFDocument({
  transaction,
  logoUrl,
  cardLast4,
}: TransactionReceiptPDFDocumentProps) {
  const dateStr = new Date(transaction.date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const amountStr =
    (transaction.direction === "credit" ? "+" : "-") +
    formatCurrency(Math.abs(transaction.amount), "USD")

  const rows: { label: string; value: string; valueStyle?: object }[] = [
    { label: "Merchant", value: transaction.description },
    { label: "Transaction ID", value: transaction.id },
    { label: "Type", value: transaction.type.toUpperCase() },
    {
      label: cardLast4 ? "Card" : "Category",
      value: cardLast4 ? `•••• ${cardLast4}` : transaction.category ?? "-",
    },
  ]

  if (transaction.reference) {
    rows.splice(2, 0, { label: "Reference", value: transaction.reference })
  }
  if (transaction.fee !== undefined && transaction.fee > 0) {
    rows.push({
      label: "Fee",
      value: formatCurrency(transaction.fee, "USD"),
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.receiptTitle}>Transaction</Text>
            <Text style={styles.receiptTitle}>Receipt</Text>
          </View>
          <Image style={styles.headerLogo} src={logoUrl} />
        </View>

        {/* Hero section: status, amount, date */}
        <View style={styles.heroSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {statusLabels[transaction.status] ?? transaction.status}
            </Text>
          </View>
          <Text
            style={[
              styles.amountBig,
              transaction.direction === "credit"
                ? styles.amountCredit
                : styles.amountDebit,
            ]}
          >
            {amountStr}
          </Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>

        {/* Transaction data table */}
        <View style={styles.tableWrapper}>
          {rows.map((row, i) => (
            <TableRow
              key={row.label}
              label={row.label}
              value={row.value}
              valueStyle={row.valueStyle}
              isFirst={i === 0}
              isLast={i === rows.length - 1}
              rowStyle={i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            For complaints regarding this transaction,
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={styles.footerTextLink}>
              please contact our support:{" "}
            </Text>
            <Text style={styles.footerEmail}>support@easner.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
