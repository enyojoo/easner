// Crypto Receive Service - Handles Bridge Liquidation Addresses and Card Top-Up addresses
// Bridge automatically handles conversion and payout when funds arrive
import { bridgeCustomerService } from "./bridge-customer-service"
import { bridgeLiquidationService } from "./bridge-liquidation-service"
import { bridgeCardsService } from "./bridge-cards-service"
import { cryptoWalletService } from "./database"

interface CreateReceiveAddressParams {
  userId: string
  userEmail?: string
  userFirstName?: string
  userLastName?: string
  destinationType: "bank" | "card"
  chain: string // e.g., "ethereum"
  currency: string // e.g., "usdc", "eurc"
  // For bank payouts
  recipientId?: string
  recipientAccountNumber?: string
  recipientBankName?: string
  recipientAccountHolderName?: string
  recipientRoutingNumber?: string
  recipientIban?: string
  recipientSwiftBic?: string
  destinationCurrency?: string // USD, EUR
  destinationWireMessage?: string
  // For card payouts
  cardFirstName?: string
  cardLastName?: string
}

interface ReceiveAddressResult {
  addressId: string
  blockchainAddress: string
  blockchainMemo?: string // For memo-based blockchains
  bridgeCustomerId: string
  destinationType: "bank" | "card"
  // Bank-specific
  liquidationAddressId?: string
  externalAccountId?: string
  // Card-specific
  cardAccountId?: string
}

export const cryptoReceiveService = {
  /**
   * Create a receive address (Liquidation Address for bank or Top-Up deposit address for card)
   * Bridge automatically handles conversion and payout when funds arrive
   */
  async createReceiveAddress(
    params: CreateReceiveAddressParams,
  ): Promise<ReceiveAddressResult> {
    // Step 1: Create or get Bridge customer
    let bridgeCustomer
    try {
      // Try to get existing customer first (if stored in database)
      // For now, we'll create a new one
      bridgeCustomer = await bridgeCustomerService.createCustomer(params.userId, {
        email: params.userEmail,
        firstName: params.userFirstName || "",
        lastName: params.userLastName || "",
      })
    } catch (error) {
      // Customer might already exist, try to get it
      // In production, you'd check database first
      throw error
    }

    if (params.destinationType === "bank") {
      // Step 2a: Create external account for bank payout
      if (!params.recipientAccountNumber || !params.recipientBankName) {
        throw new Error("Recipient account number and bank name are required for bank payouts")
      }

      const externalAccount = await bridgeCustomerService.createExternalAccount(
        bridgeCustomer.id,
        {
          accountType: params.recipientIban ? "sepa" : params.recipientRoutingNumber ? "ach" : "wire",
          accountNumber: params.recipientAccountNumber,
          routingNumber: params.recipientRoutingNumber,
          iban: params.recipientIban,
          swiftBic: params.recipientSwiftBic,
          bankName: params.recipientBankName,
          accountHolderName: params.recipientAccountHolderName || "",
          currency: params.destinationCurrency || "USD",
        },
      )

      // Step 3a: Create liquidation address pointing to external account
      const liquidationAddress = await bridgeLiquidationService.createLiquidationAddress(
        bridgeCustomer.id,
        {
          chain: params.chain,
          currency: params.currency,
          externalAccountId: externalAccount.id,
          destinationCurrency: params.destinationCurrency || "USD",
          destinationWireMessage: params.destinationWireMessage,
          idempotencyKey: `${params.userId}-${params.destinationType}-${Date.now()}`,
        },
      )

      return {
        addressId: liquidationAddress.id,
        blockchainAddress: liquidationAddress.address,
        blockchainMemo: liquidationAddress.blockchain_memo,
        bridgeCustomerId: bridgeCustomer.id,
        destinationType: "bank",
        liquidationAddressId: liquidationAddress.id,
        externalAccountId: externalAccount.id,
      }
    } else {
      // Step 2b: Create card account with Top-Up funding strategy
      if (!params.cardFirstName || !params.cardLastName) {
        throw new Error("Cardholder first and last name are required for card payouts")
      }

      const cardAccount = await bridgeCardsService.createCardAccount(bridgeCustomer.id, {
        chain: params.chain,
        currency: params.currency,
        firstName: params.cardFirstName,
        lastName: params.cardLastName,
        clientReferenceId: params.userId,
      })

      // Step 3b: Get deposit address from funding_instructions
      if (!cardAccount.funding_instructions) {
        throw new Error("Card account does not have funding instructions")
      }

      return {
        addressId: cardAccount.id,
        blockchainAddress: cardAccount.funding_instructions.address,
        blockchainMemo: undefined, // Not used for card top-up
        bridgeCustomerId: bridgeCustomer.id,
        destinationType: "card",
        cardAccountId: cardAccount.id,
      }
    }
  },

  /**
   * Get receive address details
   */
  async getReceiveAddress(
    addressId: string,
    destinationType: "bank" | "card",
    bridgeCustomerId: string,
  ): Promise<{
    blockchainAddress: string
    blockchainMemo?: string
    destinationCurrency: string
  }> {
    if (destinationType === "bank") {
      const liquidationAddress = await bridgeLiquidationService.getLiquidationAddress(
        bridgeCustomerId,
        addressId,
      )
      return {
        blockchainAddress: liquidationAddress.address,
        blockchainMemo: liquidationAddress.blockchain_memo,
        destinationCurrency: liquidationAddress.destination_currency,
      }
    } else {
      const cardAccount = await bridgeCardsService.getCardAccount(addressId)
      if (!cardAccount.funding_instructions) {
        throw new Error("Card account does not have funding instructions")
      }
      return {
        blockchainAddress: cardAccount.funding_instructions.address,
        blockchainMemo: undefined,
        destinationCurrency: cardAccount.balances.available.currency.toUpperCase(),
      }
    }
  },
}

