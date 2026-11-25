"use client"

import Link from "next/link"
import { useState } from "react"
import { useCart } from "@/components/cart-provider"
import { useBuyerSession } from "@/components/auth-session"
import type { Product, Variant } from "@/lib/types"
import { isValidRegionalPrice } from "@/lib/regions"
import { useRegion } from "@/components/region-provider"

export function AddToCart({ product, variant }: { product: Product; variant?: Variant }) {
  const { add } = useCart()
  const { token } = useBuyerSession()
  const { region } = useRegion()
  const [added, setAdded] = useState(false)
  if (!variant) return <p className="text-sm text-theme-muted">This drop is currently unavailable.</p>
  if (product.marketplace_listing?.listing_status === "SOLD") return <p className="text-sm text-theme-editorial">This piece is in the sold closet.</p>
  if (!isValidRegionalPrice(variant.calculated_price?.calculated_amount, variant.calculated_price?.currency_code, region)) {
    return <p className="text-sm text-theme-muted">This item is unavailable in your selected region.</p>
  }
  function handleAdd() {
    if (!token.trim()) { window.location.href = "/login"; return }
    if (!variant) return
    add({ product, variant })
    setAdded(true)
  }
  return <div className="flex flex-wrap gap-2">
    {token ? (
      <button className="primary-action w-full" onClick={handleAdd} disabled={added}>
        {added ? "Added to cart" : "Add to collection"}
      </button>
    ) : (
      <Link href="/login" className="primary-action w-full inline-flex min-h-12 items-center justify-center rounded-xl border border-theme-border px-5 text-xs text-theme-primary transition-colors hover:border-theme-accent">Sign in to add to collection</Link>
    )}
    {added && token && <Link className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-theme-border px-5 text-xs text-theme-primary transition-colors hover:border-theme-accent" href="/checkout">Continue to secure checkout</Link>}
    {added && !token && <Link href="/login" className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-theme-border px-5 text-xs text-theme-primary transition-colors hover:border-theme-accent">Sign in to checkout</Link>}
  </div>
}
