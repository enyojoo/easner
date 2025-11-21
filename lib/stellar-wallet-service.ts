// Stellar Wallet Service
import { Keypair, Asset, Operation, TransactionBuilder, BASE_FEE } from "@stellar/stellar-sdk"
import { horizonServer, STELLAR_NETWORK_PASSPHRASE, MIN_XLM_RESERVE, USDC_ASSET, BASE_RESERVE, TRUSTLINE_RESERVE } from "./stellar-config"
import { createServerClient } from "./supabase"
import crypto from "crypto"

// Encryption utilities for secret keys
const ENCRYPTION_KEY = process.env.STELLAR_SECRET_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const ENCRYPTION_ALGORITHM = "aes-256-gcm"

function encryptSecretKey(secretKey: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("STELLAR_SECRET_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY must be set")
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32), "utf8"), iv)

  let encrypted = cipher.update(secretKey, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

function decryptSecretKey(encryptedKey: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error("STELLAR_SECRET_ENCRYPTION_KEY or SUPABASE_SERVICE_ROLE_KEY must be set")
  }

  const parts = encryptedKey.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted key format")
  }

  const iv = Buffer.from(parts[0], "hex")
  const authTag = Buffer.from(parts[1], "hex")
  const encrypted = parts[2]

  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(ENCRYPTION_KEY.slice(0, 32), "utf8"),
    iv,
  )
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}

export const stellarWalletService = {
  /**
   * Create a new Stellar wallet for a user
   */
  async createWallet(userId: string): Promise<{
    accountId: string
    secretKey: string
    encryptedSecretKey: string
  }> {
    // Generate new keypair
    const keypair = Keypair.random()
    const accountId = keypair.publicKey()
    const secretKey = keypair.secret()

    // Encrypt the secret key
    const encryptedSecretKey = encryptSecretKey(secretKey)

    return {
      accountId,
      secretKey, // Return plaintext for funding (will be discarded after use)
      encryptedSecretKey,
    }
  },

  /**
   * Fund a Stellar account with XLM for reserves
   */
  async fundAccount(accountId: string, amount: number = MIN_XLM_RESERVE): Promise<string> {
    if (!STELLAR_FUNDING_ACCOUNT_SECRET) {
      throw new Error("STELLAR_FUNDING_ACCOUNT_SECRET must be set")
    }

    const fundingKeypair = Keypair.fromSecret(STELLAR_FUNDING_ACCOUNT_SECRET)
    const fundingAccount = await horizonServer.loadAccount(fundingKeypair.publicKey())

    const transaction = new TransactionBuilder(fundingAccount, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination: accountId,
          asset: Asset.native(),
          amount: (amount / 10000000).toFixed(7), // Convert stroops to XLM
        }),
      )
      .setTimeout(30)
      .build()

    transaction.sign(fundingKeypair)

    const result = await horizonServer.submitTransaction(transaction)
    return result.hash
  },

  /**
   * Establish USDC trustline for an account
   */
  async establishTrustline(accountId: string, encryptedSecretKey: string): Promise<string> {
    const secretKey = decryptSecretKey(encryptedSecretKey)
    const keypair = Keypair.fromSecret(secretKey)
    const account = await horizonServer.loadAccount(accountId)

    const usdcAsset = new Asset(USDC_ASSET.code, USDC_ASSET.issuer)

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.changeTrust({
          asset: usdcAsset,
        }),
      )
      .setTimeout(30)
      .build()

    transaction.sign(keypair)

    const result = await horizonServer.submitTransaction(transaction)
    return result.hash
  },

  /**
   * Get account balances (XLM and USDC)
   */
  async getAccountBalance(accountId: string): Promise<{
    xlm: number
    usdc: number
  }> {
    const account = await horizonServer.loadAccount(accountId)

    let xlmBalance = 0
    let usdcBalance = 0

    account.balances.forEach((balance) => {
      if (balance.asset_type === "native") {
        xlmBalance = parseFloat(balance.balance)
      } else if (
        balance.asset_code === USDC_ASSET.code &&
        balance.asset_issuer === USDC_ASSET.issuer
      ) {
        usdcBalance = parseFloat(balance.balance)
      }
    })

    return {
      xlm: xlmBalance,
      usdc: usdcBalance,
    }
  },

  /**
   * Check if account exists on Stellar network
   */
  async accountExists(accountId: string): Promise<boolean> {
    try {
      await horizonServer.loadAccount(accountId)
      return true
    } catch (error: any) {
      if (error.response?.status === 404) {
        return false
      }
      throw error
    }
  },

  /**
   * Get account info from Horizon
   */
  async getAccountInfo(accountId: string) {
    return await horizonServer.loadAccount(accountId)
  },

  /**
   * Calculate minimum XLM reserve needed
   */
  calculateMinReserve(numTrustlines: number = 1): number {
    return BASE_RESERVE + numTrustlines * TRUSTLINE_RESERVE
  },
}

