export const EU_REGION_ID = "reg_01M5J0TH63KAP4HJN34ERGDC5N"
export const INDIA_REGION_ID = "reg_01M5SGFGPPFNFBFRJQAAHRRNVA"
export type BuyerRegionId = typeof EU_REGION_ID | typeof INDIA_REGION_ID

export type BuyerRegion = {
  id: BuyerRegionId
  label: string
  currencyCode: "eur" | "inr"
  locale: "en-EU" | "en-IN"
}

/**
 * These public aliases map to the backend's generated Medusa Region IDs.
 * Keeping aliases in the browser makes region selection portable between
 * local seed resets. See documentation/AI_CONTEXT.md §5.5.
 */
export const BUYER_REGIONS: Record<BuyerRegionId, BuyerRegion> = {
  [EU_REGION_ID]: { id: EU_REGION_ID, label: "Europe · EUR", currencyCode: "eur", locale: "en-EU" },
  [INDIA_REGION_ID]: { id: INDIA_REGION_ID, label: "India · INR", currencyCode: "inr", locale: "en-IN" },
}

export const DEFAULT_REGION_ID: BuyerRegionId = EU_REGION_ID

export function isBuyerRegionId(value: string | undefined | null): value is BuyerRegionId {
  return value === EU_REGION_ID || value === INDIA_REGION_ID
}

export function regionIdFor(value?: string | null): BuyerRegionId {
  if (value === "reg_eu") return EU_REGION_ID
  if (value === "reg_in") return INDIA_REGION_ID
  return isBuyerRegionId(value) ? value : DEFAULT_REGION_ID
}

export function regionFor(value?: string | null): BuyerRegion {
  // Accept prior symbolic browser values while always emitting Medusa IDs to
  // native Store APIs, whose pricing middleware validates them first.
  return BUYER_REGIONS[regionIdFor(value)]
}

export function regionFromCountry(country?: string | null): BuyerRegionId {
  return country?.toUpperCase() === "IN" ? INDIA_REGION_ID : DEFAULT_REGION_ID
}

export function formatRegionalPrice(amountInCents: number | null | undefined, currencyCode = "eur"): string {
  if (!amountInCents || amountInCents <= 0) return "Unavailable"
  const normalizedCurrency = currencyCode.toLowerCase()
  const amount = amountInCents / 100
  if (normalizedCurrency === "inr") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isValidRegionalPrice(amount: number | null | undefined, currencyCode: string | null | undefined, region: BuyerRegion): boolean {
  return Boolean(amount && amount > 0 && currencyCode?.toLowerCase() === region.currencyCode)
}
