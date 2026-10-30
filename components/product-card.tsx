import Link from "next/link"
import type { Product } from "@/lib/types"
import { imageFor, priceFor } from "@/lib/medusa"
import { ListingImage } from "@/components/listing-image"

export function ProductCard({ product, sold = false }: { product: Product; sold?: boolean }) {
  const image = imageFor(product)
  return <article className="group min-w-0">
    <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-theme-surface">
      <ListingImage src={image} alt={product.title} className="size-full object-cover transition duration-700 group-hover:scale-[1.035]" />
      <span className="absolute left-3 top-3 border border-theme-border bg-theme-base px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-theme-primary">{sold ? "Sold closet" : "Authenticated drop"}</span>
    </Link>
    <div className="px-1 pb-2 pt-4">
      {product.seller && <Link className="text-xs text-theme-accent transition-opacity hover:opacity-70" href={`/sellers/${product.seller.handle}`}>✓ {product.seller.store_name}</Link>}
      <Link href={`/products/${product.id}`}><h3 className="mt-2 font-display text-2xl tracking-[-0.03em]">{product.title}</h3></Link>
      <p className="mt-1 text-xs text-theme-muted">{product.marketplace_listing?.item_condition ?? product.metadata?.item_condition ?? "One of one"}</p>
      <strong className="mt-4 block text-sm font-medium">{priceFor(product)}</strong>
    </div>
  </article>
}
