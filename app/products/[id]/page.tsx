import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCart } from "@/components/add-to-cart"
import { getLineage, getProduct, imageFor, priceFor } from "@/lib/medusa"
import { ProductAccordions } from "@/components/product-accordions"
import { ProductGallery } from "@/components/product-gallery"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) notFound()
  const lineage = await getLineage(id)
  const variant = product.variants?.[0]
  const images = Array.from(new Set([product.thumbnail, ...product.images?.map((image) => image.url) ?? [], ...product.metadata?.images ?? [], imageFor(product)].filter((image): image is string => Boolean(image))))
  const condition = product.marketplace_listing?.item_condition ?? product.metadata?.item_condition ?? "One of one"
  const available = product.marketplace_listing?.listing_status !== "SOLD" && Boolean(variant)

  return <section className="mx-auto max-w-[1440px] px-6 py-10 md:px-[5vw] md:py-14"><div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(24rem,.85fr)] xl:gap-12"><div className="xl:sticky xl:top-28"><ProductGallery images={images} title={product.title} /></div><aside className="rounded-xl border border-theme-border bg-theme-surface p-6 md:p-7"><p className="inline-flex items-center gap-2 rounded-full border border-theme-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">✓ Verified celebrity seller</p><p className="mt-3 text-sm"><Link className="text-theme-accent transition-opacity hover:opacity-70" href={product.seller ? `/sellers/${product.seller.handle}` : "/"}>{product.seller?.store_name ?? "PawnPawn verified seller"} <span aria-hidden>↗</span></Link></p><h1 className="mt-5 font-display text-[clamp(2.7rem,4vw,4.4rem)] leading-[.9] tracking-editorial">{product.title}</h1><p className="mt-6 font-display text-4xl tracking-[-0.04em]">{priceFor(product)}</p><span className="mt-3 inline-flex rounded-full border border-theme-border px-3 py-1.5 text-xs text-theme-primary">{condition}</span>
      <div className={`mt-6 rounded-lg border px-4 py-3 text-sm ${available ? "border-theme-accent text-theme-accent" : "border-theme-border text-theme-editorial"}`}>{available ? "In stock at PawnPawn HQ — 1 unit available" : "This piece is in the sold closet"}</div>
      <ul className="mt-6 space-y-3 border-y border-theme-border py-5 text-sm text-theme-muted"><li><span className="mr-3 text-theme-accent">✓</span>Authenticated by PawnPawn HQ</li><li><span className="mr-3 text-theme-accent">✓</span>Insured dispatch after certification</li><li><span className="mr-3 text-theme-accent">✓</span>Verified ownership chain</li></ul>
      <div className="mt-6"><AddToCart product={product} variant={variant} /></div>
      <ProductAccordions product={product} lineage={lineage} condition={condition} />
    </aside></div>
  </section>
}
