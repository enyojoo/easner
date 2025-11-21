// Feature Flag Service
import { createServerClient } from "./supabase"
import { dataCache, CACHE_KEYS } from "./cache"

export const featureFlagService = {
  /**
   * Get feature flag status by key
   */
  async getFeatureFlag(key: string): Promise<{
    id: string
    feature_key: string
    feature_name: string
    is_enabled: boolean
    description?: string
    updated_at: string
  } | null> {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .eq("feature_key", key)
      .single()

    if (error && error.code !== "PGRST116") {
      throw error
    }

    return data
  },

  /**
   * Check if crypto receive feature is enabled
   */
  async isCryptoReceiveEnabled(): Promise<boolean> {
    const cacheKey = CACHE_KEYS.FEATURE_FLAG("crypto_receive_enabled")

    // Try cache first
    const cached = dataCache.get<boolean>(cacheKey)
    if (cached !== undefined) {
      return cached
    }

    const refreshFn = async () => {
      const flag = await this.getFeatureFlag("crypto_receive_enabled")
      return flag?.is_enabled || false
    }

    // Try cache with background refresh
    const cachedValue = dataCache.getWithRefresh(cacheKey, refreshFn)
    if (cachedValue !== undefined) {
      return cachedValue
    }

    // If no cache, fetch fresh
    const enabled = await refreshFn()
    dataCache.set(cacheKey, enabled, 5 * 60 * 1000) // 5 minutes cache
    return enabled
  },

  /**
   * Update feature flag (admin only)
   */
  async updateFeatureFlag(
    key: string,
    isEnabled: boolean,
    updatedBy: string,
  ): Promise<{
    id: string
    feature_key: string
    feature_name: string
    is_enabled: boolean
    updated_by: string
    updated_at: string
  }> {
    try {
      console.log(`FeatureFlagService: Updating flag ${key} to ${isEnabled} by ${updatedBy}`)
    const supabase = createServerClient()

      // Check if the user exists in the users table (for foreign key constraint)
      // Admin users might be in admin_users table, not users table
      const { data: userExists } = await supabase
        .from("users")
        .select("id")
        .eq("id", updatedBy)
        .single()

      // Only set updated_by if user exists in users table, otherwise set to NULL
      const updateData: any = {
        is_enabled: isEnabled,
        updated_at: new Date().toISOString(),
      }
      
      if (userExists) {
        updateData.updated_by = updatedBy
      } else {
        // User doesn't exist in users table (likely an admin-only user)
        // Set to NULL to satisfy foreign key constraint
        updateData.updated_by = null
      }

      const { data, error } = await supabase
        .from("feature_flags")
        .update(updateData)
      .eq("feature_key", key)
      .select()
      .single()

      if (error) {
        console.error(`FeatureFlagService: Error updating flag ${key}:`, error)
        throw new Error(`Failed to update feature flag: ${error.message}`)
      }

      if (!data) {
        console.error(`FeatureFlagService: No data returned for flag ${key}`)
        throw new Error(`Feature flag ${key} not found`)
      }

      console.log(`FeatureFlagService: Successfully updated flag ${key}`)
      return data
    } catch (error) {
      console.error(`FeatureFlagService: Exception updating flag ${key}:`, error)
      throw error
    }

    // Invalidate cache
    dataCache.invalidate(CACHE_KEYS.FEATURE_FLAG(key))

    return data
  },

  /**
   * Get all feature flags (admin only)
   */
  async getAllFeatureFlags(): Promise<
    Array<{
      id: string
      feature_key: string
      feature_name: string
      is_enabled: boolean
      description?: string
      updated_by?: string
      created_at: string
      updated_at: string
    }>
  > {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("feature_name")

    if (error) {
      console.error("Error fetching feature flags from database:", error)
      throw error
    }

    console.log("Feature flags from database:", data)
    return data || []
  },
}

