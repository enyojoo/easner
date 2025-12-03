/**
 * Country-specific address formats
 * Defines which address fields are required/available for each country
 */

export interface AddressFields {
  line1: boolean // Street address
  line2: boolean // Apartment, suite, etc.
  city: boolean
  state: boolean // State/Province/Region
  postalCode: boolean // ZIP/Postal code
  stateLabel?: string // Custom label for state field (e.g., "Province", "Region")
  postalCodeLabel?: string // Custom label for postal code (e.g., "Postal Code", "ZIP Code")
}

export const addressFormats: Record<string, AddressFields> = {
  // United States
  US: {
    line1: true,
    line2: true,
    city: true,
    state: true,
    postalCode: true,
    stateLabel: 'State',
    postalCodeLabel: 'ZIP Code',
  },
  // Canada
  CA: {
    line1: true,
    line2: true,
    city: true,
    state: true,
    postalCode: true,
    stateLabel: 'Province',
    postalCodeLabel: 'Postal Code',
  },
  // United Kingdom
  GB: {
    line1: true,
    line2: true,
    city: true,
    state: false, // UK doesn't use states
    postalCode: true,
    postalCodeLabel: 'Postcode',
  },
  // Australia
  AU: {
    line1: true,
    line2: true,
    city: true,
    state: true,
    postalCode: true,
    stateLabel: 'State',
    postalCodeLabel: 'Postcode',
  },
  // Most European countries (EEA)
  DE: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  FR: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  IT: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  ES: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  NL: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  BE: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  CH: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  AT: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  SE: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  NO: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  DK: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  FI: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  IE: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  PT: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  PL: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  GR: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  RO: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  CZ: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  HU: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  BG: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  HR: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  SI: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  SK: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  LT: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  LV: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  EE: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  MT: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  CY: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  LU: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  IS: { line1: true, line2: true, city: true, state: false, postalCode: true, postalCodeLabel: 'Postal Code' },
  // Default format for countries not specifically defined (most countries use this)
}

/**
 * Get address format for a country
 * Returns default format if country not found
 */
export function getAddressFormat(countryCode: string): AddressFields {
  return addressFormats[countryCode] || {
    line1: true,
    line2: true,
    city: true,
    state: true,
    postalCode: true,
    stateLabel: 'State/Province',
    postalCodeLabel: 'Postal Code',
  }
}

