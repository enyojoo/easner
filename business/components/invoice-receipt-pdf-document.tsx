"use client"

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import {
  mockTransactions,
  mockCardTransactions,
  mockStablecoinDeposits,
  type Invoice,
  type Transaction,
  type StablecoinDeposit,
} from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"

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
    backgroundColor: "#16a34a",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
  },
  amountBig: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
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

function findTransactionById(id: string): Transaction | undefined {
  const t = mockTransactions.find((x) => x.id === id)
  if (t) return t
  return mockCardTransactions.find((x) => x.id === id)
}

function findStablecoinDepositById(id: string): StablecoinDeposit | undefined {
  return mockStablecoinDeposits.find((d) => d.id === id)
}

function TableRow({
  label,
  value,
  isFirst,
  isLast,
  rowStyle,
}: {
  label: string
  value: string
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
      <Text style={styles.tableCellValue}>{value}</Text>
    </View>
  )
}

interface InvoiceReceiptPDFDocumentProps {
  invoice: Invoice
  logoUrl: string
}

export function InvoiceReceiptPDFDocument({
  invoice,
  logoUrl,
}: InvoiceReceiptPDFDocumentProps) {
  const paidDateStr = invoice.paymentInfo
    ? formatDate(invoice.paymentInfo.paidAt, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "-"

  const rows: { label: string; value: string }[] = [
    { label: "Invoice Number", value: invoice.invoiceNumber },
    { label: "Customer", value: invoice.customerName },
    { label: "Total", value: formatCurrency(invoice.total, invoice.currency) },
    { label: "Paid Date", value: paidDateStr },
  ]

  let paymentSection: { label: string; value: string }[] = []

  if (invoice.paymentInfo?.method === "cash") {
    paymentSection = [
      {
        label: "Payment Method",
        value: "Cash or other method",
      },
      ...(invoice.paymentInfo.cashNote
        ? [{ label: "Note", value: invoice.paymentInfo.cashNote }]
        : []),
    ]
  } else if (
    invoice.paymentInfo?.method === "easner" &&
    invoice.paymentInfo.transactionId
  ) {
    const txn = findTransactionById(invoice.paymentInfo.transactionId)
    const deposit = findStablecoinDepositById(invoice.paymentInfo.transactionId)

    if (txn) {
      const method =
        txn.type === "ach"
          ? "ACH"
          : txn.type === "wire"
            ? "Wire"
            : txn.type === "book"
              ? "Book"
              : txn.type.toUpperCase()
      paymentSection = [
        { label: "Payment Method", value: method },
        { label: "Amount", value: formatCurrency(txn.amount, invoice.currency) },
        {
          label: "Date",
          value: formatDate(txn.date, {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...(txn.reference ? [{ label: "Reference", value: txn.reference }] : []),
        { label: "Description", value: txn.description },
      ]
    } else if (deposit) {
      const methodLabel = `${deposit.stablecoin} on ${deposit.chain}`
      paymentSection = [
        { label: "Payment Method", value: methodLabel },
        {
          label: "Amount",
          value: formatCurrency(deposit.amount, deposit.currency),
        },
        {
          label: "Date",
          value: formatDate(deposit.date, {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        },
        ...(deposit.reference || deposit.memo
          ? [
              {
                label: "Reference",
                value: deposit.reference ?? deposit.memo ?? "-",
              },
            ]
          : []),
      ]
    } else {
      paymentSection = [
        {
          label: "Payment Method",
          value: "Easner Banking",
        },
        {
          label: "Transaction ID",
          value: invoice.paymentInfo.transactionId,
        },
      ]
    }
  }

  const allRows = [...rows, ...paymentSection]

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.receiptTitle}>Invoice Receipt</Text>
          </View>
          <Image style={styles.headerLogo} src={logoUrl} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Paid</Text>
          </View>
          <Text style={styles.amountBig}>
            {formatCurrency(invoice.total, invoice.currency)}
          </Text>
          <Text style={styles.dateText}>{paidDateStr}</Text>
        </View>

        <View style={styles.tableWrapper}>
          {allRows.map((row, i) => (
            <TableRow
              key={row.label}
              label={row.label}
              value={row.value}
              isFirst={i === 0}
              isLast={i === allRows.length - 1}
              rowStyle={i % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}
            />
          ))}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            For questions regarding this invoice receipt,
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
