// Bridge-specific helper functions

/**
 * Convert ISO 3166-1 alpha-2 country code to alpha-3
 * Bridge API requires alpha-3 format (e.g., "USA", "GBR")
 */
export function countryCodeAlpha2ToAlpha3(alpha2: string): string {
  const mapping: Record<string, string> = {
    'US': 'USA',
    'GB': 'GBR',
    'CA': 'CAN',
    'AU': 'AUS',
    'NG': 'NGA',
    'KE': 'KEN',
    'GH': 'GHA',
    'ZA': 'ZAF',
    'IN': 'IND',
    'PK': 'PAK',
    'BD': 'BGD',
    'PH': 'PHL',
    'ID': 'IDN',
    'MY': 'MYS',
    'SG': 'SGP',
    'TH': 'THA',
    'VN': 'VNM',
    'CN': 'CHN',
    'JP': 'JPN',
    'KR': 'KOR',
    'BR': 'BRA',
    'MX': 'MEX',
    'AR': 'ARG',
    'CO': 'COL',
    'PE': 'PER',
    'CL': 'CHL',
    'EG': 'EGY',
    'MA': 'MAR',
    'TN': 'TUN',
    'DZ': 'DZA',
    'ET': 'ETH',
    'TZ': 'TZA',
    'UG': 'UGA',
    'RW': 'RWA',
    'SN': 'SEN',
    'CI': 'CIV',
    'CM': 'CMR',
    'AO': 'AGO',
    'MZ': 'MOZ',
    'ZW': 'ZWE',
    'BW': 'BWA',
    'NA': 'NAM',
    // EEA countries
    'AT': 'AUT', 'BE': 'BEL', 'BG': 'BGR', 'HR': 'HRV', 'CY': 'CYP', 'CZ': 'CZE',
    'DK': 'DNK', 'EE': 'EST', 'FI': 'FIN', 'FR': 'FRA', 'DE': 'DEU', 'GR': 'GRC',
    'HU': 'HUN', 'IE': 'IRL', 'IT': 'ITA', 'LV': 'LVA', 'LT': 'LTU', 'LU': 'LUX',
    'MT': 'MLT', 'NL': 'NLD', 'PL': 'POL', 'PT': 'PRT', 'RO': 'ROU', 'SK': 'SVK',
    'SI': 'SVN', 'ES': 'ESP', 'SE': 'SWE', 'IS': 'ISL', 'LI': 'LIE', 'NO': 'NOR',
  }
  return mapping[alpha2.toUpperCase()] || alpha2.toUpperCase()
}

/**
 * Check if country is in EEA (European Economic Area)
 */
export function isEEACountry(alpha2: string): boolean {
  const eeaCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO',
  ]
  return eeaCountries.includes(alpha2.toUpperCase())
}

/**
 * Check if country is USA
 */
export function isUSACountry(alpha2: string): boolean {
  return alpha2.toUpperCase() === 'US'
}

