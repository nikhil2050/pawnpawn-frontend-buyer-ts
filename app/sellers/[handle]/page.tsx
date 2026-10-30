import { notFound } from "next/navigation"
import { ProductCard } from "@/components/product-card"
import { getSeller } from "@/lib/medusa"
import { ListingImage } from "@/components/listing-image"

export default async function SellerPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params
  let data
  try { data = await getSeller(handle) } catch { notFound() }
  const { seller, products, archive } = data
  return <section className="px-6 py-16 md:px-[5vw] md:py-24"><header className="grid gap-7 pb-20 md:grid-cols-[7.5rem_minmax(0,38rem)]"><div className="size-28 overflow-hidden rounded-full bg-theme-surface font-display text-5xl md:size-30"><ListingImage src={seller.avatar_url ?? undefined} alt={`${seller.store_name} avatar`} className="size-full object-cover" fallbackLabel={seller.store_name.slice(0, 1)} /></div><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Verified seller <span aria-hidden>✓</span></p><h1 className="font-display text-[clamp(3rem,6vw,5rem)] leading-[.9] tracking-editorial">{seller.store_name}</h1><p className="mt-3 text-sm text-theme-muted">@{seller.handle}</p><p className="mt-6 max-w-xl text-sm leading-7 text-theme-muted">{seller.bio ?? "A curated PawnPawn collection."}</p>{seller.social_handles && <p className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-theme-muted">{Object.entries(seller.social_handles).map(([network, value]) => <span key={network}>{network}: {value}</span>)}</p>}</div></header>
    <div className="mb-10 flex items-end justify-between"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Current collection</p><h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] tracking-editorial">Available drops</h2></div><span className="text-xs text-theme-muted">{products.length} pieces</span></div><div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    <div className="mt-28 border-t border-theme-border pt-10"><div className="mb-10 flex items-end justify-between"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-editorial">A record of moments</p><h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] tracking-editorial">Sold closet</h2></div><span className="text-xs text-theme-muted">Past pieces</span></div>{archive.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">{archive.map((product) => <ProductCard key={product.id} product={product} sold />)}</div> : <p className="text-sm text-theme-muted">This closet is just getting started.</p>}</div>
  </section>
}
