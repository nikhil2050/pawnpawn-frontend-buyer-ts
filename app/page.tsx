import Link from "next/link"
import { ProductCard } from "@/components/product-card"
import { getProducts } from "@/lib/medusa"

export default async function HomePage() {
  const products = await getProducts()
  const featured = products[0]
  return <>
    <section className="ambient-hero relative isolate min-h-[650px] overflow-hidden border-b border-theme-border px-6 pb-20 pt-28 md:px-[5vw] md:pb-24 md:pt-44">
      <div aria-hidden className="ambient-wordmark pointer-events-none absolute bottom-[-0.16em] left-[3vw] font-display text-[clamp(7rem,20vw,19rem)] leading-[.8] tracking-[-0.08em]">PAWNPAWN</div>
      <div className="relative z-10 max-w-4xl"><p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">A considered collection of stories</p>
      <h1 className="max-w-4xl font-display text-[clamp(3.5rem,8vw,6.75rem)] leading-[.88] tracking-editorial">Wear the moment.<br /><em className="not-italic text-theme-editorial">Keep the story.</em></h1>
      <p className="mt-7 max-w-md text-sm leading-7 text-theme-muted">One-of-one pieces from the people who made culture. Every item travels through PawnPawn HQ for authentication, certification, and care.</p>
      <a href="#drops" className="mt-8 inline-flex min-h-12 items-center bg-theme-accent px-5 text-xs font-semibold text-theme-base transition-transform hover:-translate-y-0.5">Explore the drops</a></div>
      {featured && <Link href={`/products/${featured.id}`} className="absolute bottom-9 right-[5vw] z-10 hidden border-b border-theme-accent py-3 text-sm md:block">{featured.seller?.store_name ?? "Featured celebrity"}<span className="ml-6 text-theme-accent">↗</span></Link>}
    </section>
    <section id="drops" className="px-6 py-24 md:px-[5vw]"><div className="mb-10 flex items-end justify-between gap-6"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Available now</p><h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] tracking-editorial">Stories in circulation</h2></div><span className="pb-1 text-xs text-theme-muted">{products.length} authenticated pieces</span></div>
      {products.length ? <div className="grid grid-cols-1 gap-x-5 gap-y-10 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="border border-dashed border-theme-border px-6 py-16 text-center"><p className="font-display text-3xl">The next drop is being prepared at PawnPawn HQ.</p><small className="mt-3 block text-xs text-theme-muted">Start the Medusa backend on port 9000 to see the live catalog.</small></div>}
    </section>
    <section id="how-it-works" className="bg-theme-surface px-6 py-24 md:px-[5vw]"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Trusted from hand to hand</p><div className="mt-10 grid border-t border-theme-border md:grid-cols-3">{[["01", "Celebrity drop", "Pieces enter through the people who lived their stories."], ["02", "HQ authentication", "Every purchase is received, authenticated, and certified by PawnPawn."], ["03", "Yours to continue", "Your ownership joins a transparent record that travels with the piece."]].map(([number, title, copy], index) => <div key={number} className={`py-7 ${index ? "border-t border-theme-border md:border-l md:border-t-0 md:pl-7" : "md:pr-8"}`}><span className="text-xs text-theme-muted">{number}</span><h3 className="mt-9 font-display text-3xl tracking-[-0.04em]">{title}</h3><p className="mt-3 max-w-[15rem] text-sm leading-6 text-theme-muted">{copy}</p></div>)}</div></section>
  </>
}
