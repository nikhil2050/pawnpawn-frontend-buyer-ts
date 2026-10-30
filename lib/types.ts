export type Seller = {
  id: string
  handle: string
  store_name: string
  avatar_url?: string | null
  bio?: string | null
  verification_status?: string
  social_handles?: Record<string, string> | null
}

export type Variant = {
  id: string
  title: string
  sku?: string | null
  prices?: Array<{ amount: number; currency_code: string }>
  calculated_price?: { calculated_amount?: number; currency_code?: string }
  options?: Array<{ value: string }>
}

export type Listing = {
  id: string
  listing_status: "PENDING_APPROVAL" | "AVAILABLE" | "SOLD" | "REJECTED"
  listing_type?: "FIXED_PRICE" | "AUCTION"
  item_condition?: string | null
}

export type Product = {
  id: string
  title: string
  handle?: string | null
  description?: string | null
  thumbnail?: string | null
  metadata?: { images?: string[]; item_condition?: string; [key: string]: unknown } | null
  images?: Array<{ url: string }>
  collection?: { title: string } | null
  collection_id?: string | null
  categories?: Array<{ id: string; name: string }>
  options?: Array<{ title: string; values: Array<{ value: string }> }>
  variants?: Variant[]
  seller?: Seller | null
  marketplace_listing?: Listing
}

export type CartItem = {
  product: Product
  variant: Variant
}

export type LineageEntry = {
  id: string
  seller_id?: string
  buyer_id?: string
  price?: number | string
  transacted_at: string
  seller?: Pick<Seller, "handle" | "store_name" | "avatar_url"> | null
}
