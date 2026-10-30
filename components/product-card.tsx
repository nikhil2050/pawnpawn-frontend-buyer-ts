import Link from "next/link"
import type { Product } from "@/lib/types"
import { imageFor, priceFor } from "@/lib/medusa"
import { ListingImage } from "@/components/listing-image"

export function ProductCard({ product, sold = false }: { product: Product; sold?: boolean }) {
  const image = imageFor(product)
  const condition = product.marketplace_listing?.item_condition ?? product.metadata?.item_condition ?? "One of one"

  return <article className="group elevated-panel min-w-0 overflow-hidden transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-theme-accent">
    <Link href={`/products/${product.id}`} className="relative block aspect-[4/5] overflow-hidden bg-theme-surface">
      <ListingImage src={image} alt={product.title} className="size-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105" />
      <span className="absolute left-3 top-3 border border-theme-border bg-theme-base/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-theme-primary">✓ HQ Verified</span>
      {sold && <span className="absolute right-3 top-3 border border-theme-border bg-theme-base/90 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-theme-muted">Sold closet</span>}
    </Link>
    <div className="p-5">
      <Link href={`/products/${product.id}`}><h3 className="font-display text-2xl tracking-[-0.03em]">{product.title}</h3></Link>
      {product.seller && <Link className="mt-1 inline-block text-xs text-theme-accent transition-opacity hover:opacity-70" href={`/sellers/${product.seller.handle}`}>@{product.seller.handle}</Link>}
      <div className="mt-4 flex items-center justify-between gap-3"><strong className="font-display text-xl font-bold tracking-[-0.03em] text-theme-primary">{priceFor(product)}</strong><span className="shrink-0 rounded-full border border-theme-border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-theme-muted">{condition}</span></div>
    </div>
  </article>
}
