import Link from "next/link"
import { notFound } from "next/navigation"
import { AddToCart } from "@/components/add-to-cart"
import { getLineage, getProduct, imageFor, priceFor } from "@/lib/medusa"
import { ProductAccordions } from "@/components/product-accordions"
import { ProductGallery } from "@/components/product-gallery"
import { regionFromCountry, regionIdFor } from "@/lib/regions"
import { cookies, headers } from "next/headers"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const requestHeaders = await headers()
  const selected = cookieStore.get("pawn_region_id")?.value
  const regionId = selected ? regionIdFor(selected) : regionFromCountry(requestHeaders.get("cf-ipcountry"))
  const product = await getProduct(id, regionId)
  if (!product) notFound()

  const lineage = await getLineage(id)
  const variant = product.variants?.[0]
  const images = Array.from(new Set([
    product.thumbnail,
    ...product.images?.map((image) => image.url) ?? [],
    ...product.metadata?.images ?? [],
    imageFor(product),
  ].filter((image): image is string => Boolean(image))))
  const condition = product.marketplace_listing?.item_condition ?? product.metadata?.item_condition ?? "One of one"

  return <section className="page-container py-10 md:py-14">
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
      <div className="lg:sticky lg:top-24">
        <ProductGallery images={images} title={product.title} />
      </div>

      <aside className="rounded-xl border border-theme-border bg-theme-surface p-6 shadow-2xl lg:sticky lg:top-24 md:p-7">
        <p className="inline-flex items-center gap-2 rounded-full border border-theme-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">
          ✓ Verified celebrity seller
        </p>
        <p className="mt-3 text-sm">
          <Link className="text-theme-accent transition-opacity hover:opacity-70" href={product.seller ? `/sellers/${product.seller.handle}` : "/"}>
            {product.seller?.store_name ?? "PawnPawn verified seller"} {product.seller?.handle ? `@${product.seller.handle}` : ""} <span aria-hidden>↗</span>
          </Link>
        </p>
        <h1 className="mt-5 font-display text-[clamp(2.7rem,4vw,4.4rem)] leading-[.9] tracking-editorial">{product.title}</h1>
        <p className="mt-6 font-display text-4xl tracking-[-0.04em]">{priceFor(product)}</p>
        <span className="mt-3 inline-flex rounded-full border border-theme-border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-theme-primary">{condition}</span>

        <ul className="mt-6 space-y-3 border-y border-theme-border py-5 text-sm text-theme-muted">
          <li><span className="mr-3 text-theme-accent">✓</span>Authenticated &amp; Certified by PawnPawn HQ</li>
          <li><span className="mr-3 text-theme-accent">✓</span>Insured Global Dispatch</li>
          <li><span className="mr-3 text-theme-accent">✓</span>Immutable Ownership Chain (Lineage Verified)</li>
        </ul>

        <div className="mt-6"><AddToCart product={product} variant={variant} /></div>
      </aside>
    </div>

    <section aria-labelledby="item-dossier" className="mt-12 rounded-xl border border-theme-border bg-theme-surface p-6 md:p-7 lg:max-w-[60%]">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Complete item record</p>
      <h2 id="item-dossier" className="mt-3 font-display text-3xl tracking-[-0.04em]">Item dossier</h2>
      <ProductAccordions product={product} lineage={lineage} condition={condition} />
    </section>
  </section>
}
