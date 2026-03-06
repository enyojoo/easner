"use client"

import {
  Document,
  Page,
  Text,
  View,
  Image,
  Link,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Invoice } from "@/lib/mock-data"
import type { Account } from "@/lib/mock-data"
import type { StablecoinAccount } from "@/lib/mock-data"
import { businessInfo } from "@/lib/business-info"
import { formatDate, formatCurrency } from "@/lib/utils"
import { getPaymentInstructions } from "@/lib/payment-instructions"

const statusLabels: Record<string, string> = {
  draft: "Draft",
  open: "Unpaid",
  sent: "Sent",
  past_due: "Past due",
  paid: "Paid",
  void: "Void",
  uncollectible: "Uncollectible",
  failed: "Failed",
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingBottom: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  businessInfo: {
    flexDirection: "column",
  },
  businessName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  businessText: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  invoiceHeader: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textAlign: "right",
  },
  statusBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-end",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 24,
  },
  gridCol: {
    flex: 1,
  },
  gridColEmpty: {
    flex: 1,
  },
  gridColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionTitleRight: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: "right",
  },
  sectionTextRight: {
    fontSize: 10,
    marginBottom: 2,
    textAlign: "right",
  },
  sectionText: {
    fontSize: 10,
    marginBottom: 2,
  },
  sectionTextMuted: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 2,
  },
  table: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  tableCell: {
    fontSize: 10,
  },
  colDesc: { width: "40%" },
  colQty: { width: "15%", textAlign: "right" },
  colPrice: { width: "22%", textAlign: "right" },
  colAmount: { width: "23%", textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  totalBox: {
    alignItems: "flex-end",
  },
  totalLabel: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paymentSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
  },
  paymentTwoCol: {
    flexDirection: "row",
    gap: 16,
  },
  paymentCol: {
    flex: 1,
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 6,
    backgroundColor: "#fafafa",
    padding: 14,
    minHeight: 220,
  },
  paymentColContent: {
    flexGrow: 1,
  },
  paymentColTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
  },
  paymentField: {
    marginBottom: 10,
  },
  paymentFieldLabel: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  paymentFieldValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
  },
  paymentInstructions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  paymentInstructionsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 6,
  },
  paymentInstructionItem: {
    fontSize: 8,
    color: "#6b7280",
    marginBottom: 4,
  },
  stablecoinRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  qrBox: {
    alignItems: "center",
    flexShrink: 0,
  },
  qrImage: {
    width: 80,
    height: 80,
    marginBottom: 4,
  },
  stablecoinDetails: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 12,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 9,
    color: "#6b7280",
  },
  footerLogo: {
    width: 90,
    height: 36,
    objectFit: "contain",
    flexShrink: 0,
  },
})

interface InvoicePDFDocumentProps {
  invoice: Invoice
  bankAccount?: Account
  stablecoinAccount?: StablecoinAccount
  logoUrl: string
  qrDataUrl?: string
}

export function InvoicePDFDocument({
  invoice,
  bankAccount,
  stablecoinAccount,
  logoUrl,
  qrDataUrl,
}: InvoicePDFDocumentProps) {
  const showPayCard =
    (invoice.status === "open" || invoice.status === "sent" || invoice.status === "past_due") && bankAccount

  const formatDatePdf = (dateString: string) =>
    formatDate(dateString, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const bankInstructions = getPaymentInstructions(invoice.currency, "bank")
  const stablecoinInstructions = getPaymentInstructions(
    invoice.currency,
    "stablecoin"
  )

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessInfo.name}</Text>
            <Text style={styles.businessText}>{businessInfo.address}</Text>
            <Text style={styles.businessText}>
              {businessInfo.city}, {businessInfo.state} {businessInfo.zipCode}
            </Text>
            <Text style={styles.businessText}>{businessInfo.country}</Text>
            <Text style={styles.businessText}>{businessInfo.email}</Text>
            <Text style={styles.businessText}>{businessInfo.phone}</Text>
          </View>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceTitle}>Invoice</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {statusLabels[invoice.status] ?? invoice.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Bill to & Invoice details */}
        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <Text style={styles.sectionTitle}>Bill to</Text>
            {invoice.billToType === "company" && invoice.customerCompany ? (
              <>
                <Text style={styles.sectionText}>{invoice.customerCompany}</Text>
                <Text style={styles.sectionTextMuted}>{invoice.customerEmail}</Text>
                {invoice.customerAddress ? (
                  <Text style={styles.sectionTextMuted}>{invoice.customerAddress}</Text>
                ) : null}
                {invoice.customerPhone ? (
                  <Text style={styles.sectionTextMuted}>{invoice.customerPhone}</Text>
                ) : null}
                {invoice.customerName ? (
                  <Text style={[styles.sectionTextMuted, { marginTop: 4 }]}>
                    Attn: {invoice.customerName}
                  </Text>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.sectionText}>{invoice.customerName}</Text>
                <Text style={styles.sectionTextMuted}>{invoice.customerEmail}</Text>
                {invoice.customerAddress ? (
                  <Text style={styles.sectionTextMuted}>{invoice.customerAddress}</Text>
                ) : null}
                {invoice.customerPhone ? (
                  <Text style={styles.sectionTextMuted}>{invoice.customerPhone}</Text>
                ) : null}
              </>
            )}
          </View>
          <View style={styles.gridColEmpty} />
          <View style={styles.gridColRight}>
            <Text style={styles.sectionTitleRight}>Invoice details</Text>
            <Text style={styles.sectionTextRight}>
              Due date: {formatDatePdf(invoice.dueDate)}
            </Text>
            <Text style={styles.sectionTextRight}>
              Created: {formatDatePdf(invoice.createdDate)}
            </Text>
          </View>
        </View>

        {invoice.memo?.trim() ? (
          <View style={[styles.grid, { marginBottom: 16 }]}>
            <View style={styles.gridCol}>
              <Text style={styles.sectionTitle}>Memo</Text>
              <Text style={styles.sectionText}>{invoice.memo}</Text>
            </View>
          </View>
        ) : null}

        {/* Line items table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>
              Unit Price
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>
              Amount
            </Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice]}>
                {formatCurrency(item.unitPrice, invoice.currency)}
              </Text>
              <Text style={[styles.tableCell, styles.colAmount]}>
                {formatCurrency(item.amount, invoice.currency)}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(invoice.total, invoice.currency)}
            </Text>
          </View>
        </View>

        {/* Payment options - two columns: bank and stablecoin */}
        {showPayCard && (
          <View style={styles.paymentSection} wrap={false}>
            <Text style={styles.paymentSectionTitle}>
              Invoice payment options
            </Text>
            <View style={styles.paymentTwoCol}>
              {/* Bank column */}
              <View style={styles.paymentCol}>
                <View style={styles.paymentColContent}>
                  <Text style={styles.paymentColTitle}>
                    {bankAccount.currency === "USD"
                      ? "US Bank Account"
                      : bankAccount.currency === "EUR"
                        ? "EU Bank Account"
                        : "Bank transfer"}
                  </Text>
                  <View style={styles.paymentField}>
                    <Text style={styles.paymentFieldLabel}>Account Name</Text>
                    <Text style={styles.paymentFieldValue}>
                      {bankAccount.accountName}
                    </Text>
                  </View>
                  {bankAccount.currency === "EUR" && bankAccount.iban ? (
                    <>
                      <View style={styles.paymentField}>
                        <Text style={styles.paymentFieldLabel}>IBAN</Text>
                        <Text style={styles.paymentFieldValue}>
                          {bankAccount.iban}
                        </Text>
                      </View>
                      {bankAccount.bic && (
                        <View style={styles.paymentField}>
                          <Text style={styles.paymentFieldLabel}>BIC/SWIFT</Text>
                          <Text style={styles.paymentFieldValue}>
                            {bankAccount.bic}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <View style={styles.paymentField}>
                        <Text style={styles.paymentFieldLabel}>
                          Account Number
                        </Text>
                        <Text style={styles.paymentFieldValue}>
                          {bankAccount.fullAccountNumber}
                        </Text>
                      </View>
                      {bankAccount.routingNumber && (
                        <View style={styles.paymentField}>
                          <Text style={styles.paymentFieldLabel}>
                            Routing Number
                          </Text>
                          <Text style={styles.paymentFieldValue}>
                            {bankAccount.routingNumber}
                          </Text>
                        </View>
                      )}
                      {bankAccount.sortCode && (
                        <View style={styles.paymentField}>
                          <Text style={styles.paymentFieldLabel}>Sort Code</Text>
                          <Text style={styles.paymentFieldValue}>
                            {bankAccount.sortCode}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                  <View style={styles.paymentField}>
                    <Text style={styles.paymentFieldLabel}>Bank Name</Text>
                    <Text style={styles.paymentFieldValue}>
                      {bankAccount.bankName}
                    </Text>
                  </View>
                  {bankAccount.bankAddress && (
                    <View style={styles.paymentField}>
                      <Text style={styles.paymentFieldLabel}>Address</Text>
                      <Text style={styles.paymentFieldValue}>
                        {bankAccount.bankAddress}
                      </Text>
                    </View>
                  )}
                </View>
                {bankInstructions.length > 0 && (
                  <View style={styles.paymentInstructions}>
                    <Text style={styles.paymentInstructionsTitle}>
                      Payment Instructions
                    </Text>
                    {bankInstructions.map((line, i) => (
                      <Text
                        key={i}
                        style={styles.paymentInstructionItem}
                      >{`• ${line}`}</Text>
                    ))}
                  </View>
                )}
              </View>

              {/* Stablecoin column */}
              <View style={styles.paymentCol}>
                {stablecoinAccount && qrDataUrl ? (
                  <>
                    <View style={styles.paymentColContent}>
                      <Text style={styles.paymentColTitle}>Stablecoin</Text>
                      <View style={styles.stablecoinRow}>
                        <View style={styles.qrBox}>
                          <Image style={styles.qrImage} src={qrDataUrl} />
                          <Text style={styles.sectionTextMuted}>
                            Scan to send {stablecoinAccount.stablecoin}
                          </Text>
                        </View>
                        <View style={styles.stablecoinDetails}>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentFieldLabel}>Network</Text>
                            <Text style={styles.paymentFieldValue}>
                              {stablecoinAccount.chain}
                            </Text>
                          </View>
                          <View style={styles.paymentField}>
                            <Text style={styles.paymentFieldLabel}>Address</Text>
                            <Text style={styles.paymentFieldValue}>
                              {stablecoinAccount.address}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    {stablecoinInstructions.length > 0 && (
                      <View style={styles.paymentInstructions}>
                        <Text style={styles.paymentInstructionsTitle}>
                          Payment Instructions
                        </Text>
                        {stablecoinInstructions.map((line, i) => (
                          <Text
                            key={i}
                            style={styles.paymentInstructionItem}
                          >{`• ${line}`}</Text>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <Text style={styles.sectionTextMuted}>
                    Stablecoin not available for {invoice.currency}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Footer: Powered by Easner Business */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Powered by</Text>
          <Link src="https://www.easner.com/business">
            <Image style={styles.footerLogo} src={logoUrl} />
          </Link>
        </View>
      </Page>
    </Document>
  )
}
