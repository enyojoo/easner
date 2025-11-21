// Stellar Network Configuration
import { Networks, Horizon } from "@stellar/stellar-sdk"

export const STELLAR_NETWORK = (process.env.STELLAR_NETWORK || "testnet") as "testnet" | "mainnet"
export const STELLAR_HORIZON_URL =
  process.env.STELLAR_HORIZON_URL ||
  (STELLAR_NETWORK === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org")

export const STELLAR_FUNDING_ACCOUNT_SECRET = process.env.STELLAR_FUNDING_ACCOUNT_SECRET
export const STELLAR_USDC_ISSUER = process.env.STELLAR_USDC_ISSUER || "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"

// Stellar network passphrase
export const STELLAR_NETWORK_PASSPHRASE =
  STELLAR_NETWORK === "mainnet" ? Networks.PUBLIC : Networks.TESTNET

// Horizon server instance
export const horizonServer = new Horizon.Server(STELLAR_HORIZON_URL, {
  allowHttp: STELLAR_NETWORK === "testnet",
})

// Minimum XLM reserve required for account operations (in stroops, 1 XLM = 10,000,000 stroops)
export const MIN_XLM_RESERVE = 10000000 // 1 XLM
export const BASE_RESERVE = 5000000 // 0.5 XLM base reserve
export const TRUSTLINE_RESERVE = 2500000 // 0.25 XLM per trustline

// USDC Asset on Stellar
export const USDC_ASSET = {
  code: "USDC",
  issuer: STELLAR_USDC_ISSUER,
}

