"use client"

import Link from "next/link"
import { useState } from "react"
import { useCart } from "@/components/cart-provider"
import type { Product, Variant } from "@/lib/types"

export function AddToCart({ product, variant }: { product: Product; variant?: Variant }) {
  const { add } = useCart()
  const [added, setAdded] = useState(false)
  if (!variant) return <p className="text-sm text-theme-muted">This drop is currently unavailable.</p>
  if (product.marketplace_listing?.listing_status === "SOLD") return <p className="text-sm text-theme-editorial">This piece is in the sold closet.</p>
  return <div className="flex flex-wrap gap-2">
    <button className="inline-flex min-h-14 w-full items-center justify-center rounded-lg bg-theme-accent px-5 py-4 text-sm font-semibold text-theme-base transition-transform hover:-translate-y-0.5" onClick={() => { add({ product, variant }); setAdded(true) }}>
      {added ? "Added to cart" : "Add to collection"}
    </button>
    {added && <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-lg border border-theme-border px-5 text-xs text-theme-primary" href="/checkout">Continue to secure checkout</Link>}
  </div>
}
