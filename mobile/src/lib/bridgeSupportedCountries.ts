// Bridge-supported countries list
// Based on Bridge's supported countries documentation
// Excludes Prohibited and Controlled countries

/**
 * Countries that Bridge does NOT support (Prohibited)
 * Bridge will not facilitate services for these jurisdictions
 */
const PROHIBITED_COUNTRIES = [
  'CU', // Cuba (CUB)
  'IR', // Iran (IRN)
  'MM', // Myanmar (MMR)
  'KP', // North Korea (PRK)
  'SY', // Syria (SYR)
  // Ukrainian Territories (Crimea, Sevastopol, Donetsk, Kherson, Luhansk, Zaporizhzhia)
  // Note: These are territories, not standard ISO codes, so we handle separately if needed
]

/**
 * Countries that Bridge does NOT support (Controlled)
 * Bridge will not facilitate services except for specially approved programs
 */
const CONTROLLED_COUNTRIES = [
  'AF', // Afghanistan (AFG)
  'DZ', // Algeria (DZA)
  'BD', // Bangladesh (BGD)
  'BY', // Belarus (BLR)
  'CN', // China (CHN)
  'CD', // Congo, the Democratic Republic (COD)
  'PS', // Gaza Strip / West Bank (PSE)
  'HT', // Haiti (HTI)
  'IQ', // Iraq (IRQ)
  'LB', // Lebanon (LBN)
  'LY', // Libya (LBY)
  'MA', // Morocco (MAR)
  'MZ', // Mozambique (MOZ)
  'NP', // Nepal (NPL)
  'NI', // Nicaragua (NIC)
  'MK', // North Macedonia (MKD)
  'QA', // Qatar (QAT)
  'PK', // Pakistan (PAK)
  'RU', // Russia (RUS)
  'SO', // Somalia (SOM)
  'SS', // South Sudan (SSD)
  'SD', // Sudan (SDN)
  'VE', // Venezuela (VEN)
  'YE', // Yemen (YEM)
]

/**
 * Check if a country code (ISO alpha-2) is supported by Bridge
 * Returns true if the country is NOT in Prohibited or Controlled lists
 */
export function isBridgeSupportedCountry(countryCode: string): boolean {
  const code = countryCode?.toUpperCase()
  if (!code) return false
  
  // Check if country is prohibited
  if (PROHIBITED_COUNTRIES.includes(code)) {
    return false
  }
  
  // Check if country is controlled
  if (CONTROLLED_COUNTRIES.includes(code)) {
    return false
  }
  
  // All other countries are supported (Restricted or Not High Risk)
  return true
}

/**
 * Filter an array of countries to only include Bridge-supported ones
 */
export function filterBridgeSupportedCountries<T extends { code: string }>(
  countries: T[]
): T[] {
  return countries.filter(country => isBridgeSupportedCountry(country.code))
}

