// Country codes and their supported ID types
export const countryIdTypes: Record<string, { name: string; idTypes: string[] }> = {
  US: { name: "United States", idTypes: ["passport", "drivers_license", "state_id"] },
  GB: { name: "United Kingdom", idTypes: ["passport", "drivers_license", "national_id"] },
  CA: { name: "Canada", idTypes: ["passport", "drivers_license", "provincial_id"] },
  AU: { name: "Australia", idTypes: ["passport", "drivers_license"] },
  NG: { name: "Nigeria", idTypes: ["passport", "national_id", "drivers_license", "voters_card"] },
  KE: { name: "Kenya", idTypes: ["passport", "national_id", "drivers_license"] },
  GH: { name: "Ghana", idTypes: ["passport", "national_id", "drivers_license", "voters_id"] },
  ZA: { name: "South Africa", idTypes: ["passport", "national_id", "drivers_license"] },
  IN: { name: "India", idTypes: ["passport", "aadhaar", "pan_card", "drivers_license"] },
  PK: { name: "Pakistan", idTypes: ["passport", "cnic", "drivers_license"] },
  BD: { name: "Bangladesh", idTypes: ["passport", "national_id", "drivers_license"] },
  PH: { name: "Philippines", idTypes: ["passport", "national_id", "drivers_license"] },
  ID: { name: "Indonesia", idTypes: ["passport", "ktp", "drivers_license"] },
  MY: { name: "Malaysia", idTypes: ["passport", "mykad", "drivers_license"] },
  SG: { name: "Singapore", idTypes: ["passport", "nric", "drivers_license"] },
  TH: { name: "Thailand", idTypes: ["passport", "national_id", "drivers_license"] },
  VN: { name: "Vietnam", idTypes: ["passport", "national_id", "drivers_license"] },
  CN: { name: "China", idTypes: ["passport", "national_id", "drivers_license"] },
  JP: { name: "Japan", idTypes: ["passport", "my_number", "drivers_license"] },
  KR: { name: "South Korea", idTypes: ["passport", "national_id", "drivers_license"] },
  BR: { name: "Brazil", idTypes: ["passport", "rg", "cpf", "drivers_license"] },
  MX: { name: "Mexico", idTypes: ["passport", "ine", "drivers_license"] },
  AR: { name: "Argentina", idTypes: ["passport", "dni", "drivers_license"] },
  CO: { name: "Colombia", idTypes: ["passport", "cedula", "drivers_license"] },
  PE: { name: "Peru", idTypes: ["passport", "dni", "drivers_license"] },
  CL: { name: "Chile", idTypes: ["passport", "rut", "drivers_license"] },
  EG: { name: "Egypt", idTypes: ["passport", "national_id", "drivers_license"] },
  MA: { name: "Morocco", idTypes: ["passport", "national_id", "drivers_license"] },
  TN: { name: "Tunisia", idTypes: ["passport", "national_id", "drivers_license"] },
  DZ: { name: "Algeria", idTypes: ["passport", "national_id", "drivers_license"] },
  ET: { name: "Ethiopia", idTypes: ["passport", "national_id", "drivers_license"] },
  TZ: { name: "Tanzania", idTypes: ["passport", "national_id", "drivers_license"] },
  UG: { name: "Uganda", idTypes: ["passport", "national_id", "drivers_license"] },
  RW: { name: "Rwanda", idTypes: ["passport", "national_id", "drivers_license"] },
  SN: { name: "Senegal", idTypes: ["passport", "national_id", "drivers_license"] },
  CI: { name: "Ivory Coast", idTypes: ["passport", "national_id", "drivers_license"] },
  CM: { name: "Cameroon", idTypes: ["passport", "national_id", "drivers_license"] },
  AO: { name: "Angola", idTypes: ["passport", "national_id", "drivers_license"] },
  MZ: { name: "Mozambique", idTypes: ["passport", "national_id", "drivers_license"] },
  ZW: { name: "Zimbabwe", idTypes: ["passport", "national_id", "drivers_license"] },
  BW: { name: "Botswana", idTypes: ["passport", "national_id", "drivers_license"] },
  NA: { name: "Namibia", idTypes: ["passport", "national_id", "drivers_license"] },
  ZM: { name: "Zambia", idTypes: ["passport", "national_id", "drivers_license"] },
  MW: { name: "Malawi", idTypes: ["passport", "national_id", "drivers_license"] },
  // Add more countries as needed
}

export const idTypeLabels: Record<string, string> = {
  passport: "Passport",
  drivers_license: "Driver's License",
  national_id: "National ID",
  state_id: "State ID",
  provincial_id: "Provincial ID",
  voters_card: "Voter's Card",
  voters_id: "Voter's ID",
  aadhaar: "Aadhaar Card",
  pan_card: "PAN Card",
  cnic: "CNIC",
  ktp: "KTP (Indonesian ID)",
  mykad: "MyKad",
  nric: "NRIC",
  my_number: "My Number",
  rg: "RG (Brazilian ID)",
  cpf: "CPF",
  ine: "INE (Mexican ID)",
  dni: "DNI",
  cedula: "Cédula",
  rut: "RUT",
}

export const countries = Object.entries(countryIdTypes).map(([code, data]) => ({
  code,
  name: data.name,
}))

export function getIdTypesForCountry(countryCode: string): string[] {
  return countryIdTypes[countryCode]?.idTypes || ["passport", "national_id", "drivers_license"]
}

export function getIdTypeLabel(idType: string): string {
  return idTypeLabels[idType] || idType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}


