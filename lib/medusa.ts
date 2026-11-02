import type { LineageEntry, Product, Seller } from "@/lib/types"
import { BuyerRegionId, DEFAULT_REGION_ID, formatRegionalPrice, regionFor } from "@/lib/regions"

export const backendUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9000").replace(/\/$/, "")
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"

const headers = { "x-publishable-api-key": publishableKey }

async function storefrontFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${backendUrl}${path}`, {
    headers,
    next: { revalidate: 0 },
  })
  if (!response.ok) throw new Error(`PawnPawn backend responded with ${response.status}`)
  return response.json() as Promise<T>
}

export async function getProducts(regionId: BuyerRegionId = DEFAULT_REGION_ID) {
  try {
    const region = regionFor(regionId)
    const query = new URLSearchParams({ limit: "48", region_id: region.id })
    const payload = await storefrontFetch<{ products: Product[] }>(`/store/products?${query}`)
    return payload.products ?? []
  } catch {
    return []
  }
}

export async function getProduct(id: string, regionId: BuyerRegionId = DEFAULT_REGION_ID) {
  const products = await getProducts(regionId)
  return products.find((product) => product.id === id) ?? null
}

export async function getSeller(handle: string, regionId: BuyerRegionId = DEFAULT_REGION_ID) {
  const region = regionFor(regionId)
  const query = new URLSearchParams({ region_id: region.id })
  return storefrontFetch<{ seller: Seller; products: Product[]; archive: Product[] }>(`/store/sellers/${encodeURIComponent(handle)}?${query}`)
}

export async function getLineage(id: string) {
  try {
    const payload = await storefrontFetch<{ lineage?: LineageEntry[]; history?: LineageEntry[] }>(`/store/products/${encodeURIComponent(id)}/lineage`)
    return payload.lineage ?? payload.history ?? []
  } catch {
    return []
  }
}

export function imageFor(product: Product) {
  const images = product.metadata?.images
  return product.thumbnail ?? product.images?.[0]?.url ?? images?.[0] ?? ""
}

export function priceFor(product: Product) {
  const variant = product.variants?.[0]
  const amount = variant?.calculated_price?.calculated_amount ?? variant?.prices?.[0]?.amount
  const currency = variant?.calculated_price?.currency_code ?? variant?.prices?.[0]?.currency_code ?? "eur"
  return formatRegionalPrice(amount, currency)
}
