// Username Service (Easetag)
// Handles username lookup for P2P transfers (Cashtag-style)
// Maps @username to bridge_wallet_id for wallet-to-wallet transfers

import { createServerClient } from "./supabase"

export interface UsernameLookupResult {
  userId: string
  easetag: string
  bridgeWalletId: string | null
  firstName: string | null
  lastName: string | null
  email: string
}

/**
 * Validate easetag format
 * Rules:
 * - 3-20 characters
 * - Lowercase alphanumeric, underscore, or hyphen only
 * - Must start with a letter or number
 */
export function validateEasetag(easetag: string): { valid: boolean; error?: string } {
  if (!easetag) {
    return { valid: false, error: "Easetag is required" }
  }

  // Remove @ if present
  const cleanTag = easetag.replace(/^@/, "").toLowerCase()

  if (cleanTag.length < 3) {
    return { valid: false, error: "Easetag must be at least 3 characters" }
  }

  if (cleanTag.length > 20) {
    return { valid: false, error: "Easetag must be 20 characters or less" }
  }

  // Must start with letter or number
  if (!/^[a-z0-9]/.test(cleanTag)) {
    return { valid: false, error: "Easetag must start with a letter or number" }
  }

  // Only lowercase alphanumeric, underscore, hyphen
  if (!/^[a-z0-9_-]+$/.test(cleanTag)) {
    return { valid: false, error: "Easetag can only contain letters, numbers, underscore, and hyphen" }
  }

  // Reserved words (add more as needed)
  const reservedWords = ["admin", "support", "help", "api", "www", "mail", "root", "system"]
  if (reservedWords.includes(cleanTag)) {
    return { valid: false, error: "This easetag is reserved" }
  }

  return { valid: true }
}

/**
 * Check if easetag is available
 */
export async function isEasetagAvailable(easetag: string, excludeUserId?: string): Promise<boolean> {
  const validation = validateEasetag(easetag)
  if (!validation.valid) {
    return false
  }

  const cleanTag = easetag.replace(/^@/, "").toLowerCase()
  const serverClient = createServerClient()

  let query = serverClient
    .from("users")
    .select("id")
    .eq("easetag", cleanTag)
    .limit(1)

  if (excludeUserId) {
    query = query.neq("id", excludeUserId)
  }

  const { data, error } = await query

  if (error) {
    console.error("[USERNAME-SERVICE] Error checking easetag availability:", error)
    throw new Error(`Failed to check easetag availability: ${error.message}`)
  }

  return !data || data.length === 0
}

/**
 * Set easetag for a user
 */
export async function setEasetag(userId: string, easetag: string): Promise<void> {
  const validation = validateEasetag(easetag)
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid easetag format")
  }

  const cleanTag = easetag.replace(/^@/, "").toLowerCase()

  // Check availability
  const available = await isEasetagAvailable(cleanTag, userId)
  if (!available) {
    throw new Error("Easetag is already taken")
  }

  const serverClient = createServerClient()
  const { error } = await serverClient
    .from("users")
    .update({ easetag: cleanTag })
    .eq("id", userId)

  if (error) {
    console.error("[USERNAME-SERVICE] Error setting easetag:", error)
    throw new Error(`Failed to set easetag: ${error.message}`)
  }
}

/**
 * Get wallet ID by username (for P2P transfers)
 * Resolves @username to bridge_wallet_id
 */
export async function getWalletIdByUsername(
  username: string
): Promise<UsernameLookupResult | null> {
  const cleanTag = username.replace(/^@/, "").toLowerCase()
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from("users")
    .select(`
      id,
      easetag,
      bridge_wallet_id,
      first_name,
      last_name,
      email
    `)
    .eq("easetag", cleanTag)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null
    }
    console.error("[USERNAME-SERVICE] Error looking up username:", error)
    throw new Error(`Failed to lookup username: ${error.message}`)
  }

  if (!data) {
    return null
  }

  return {
    userId: data.id,
    easetag: data.easetag,
    bridgeWalletId: data.bridge_wallet_id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
  }
}

/**
 * Get username by wallet ID (reverse lookup)
 */
export async function getUsernameByWalletId(
  walletId: string
): Promise<string | null> {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from("users")
    .select("easetag")
    .eq("bridge_wallet_id", walletId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("[USERNAME-SERVICE] Error looking up username by wallet ID:", error)
    throw new Error(`Failed to lookup username: ${error.message}`)
  }

  return data?.easetag || null
}

/**
 * Get username by user ID
 */
export async function getUsernameByUserId(userId: string): Promise<string | null> {
  const serverClient = createServerClient()

  const { data, error } = await serverClient
    .from("users")
    .select("easetag")
    .eq("id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    console.error("[USERNAME-SERVICE] Error getting username:", error)
    throw new Error(`Failed to get username: ${error.message}`)
  }

  return data?.easetag || null
}

/**
 * Remove easetag (set to null)
 */
export async function removeEasetag(userId: string): Promise<void> {
  const serverClient = createServerClient()
  const { error } = await serverClient
    .from("users")
    .update({ easetag: null })
    .eq("id", userId)

  if (error) {
    console.error("[USERNAME-SERVICE] Error removing easetag:", error)
    throw new Error(`Failed to remove easetag: ${error.message}`)
  }
}

