import Link from "next/link"
import { DiscoveryCatalog } from "@/components/discovery-catalog"
import { getProducts } from "@/lib/medusa"

export default async function HomePage() {
  const products = await getProducts()
  const featured = products[0]

  return <>
    <section className="ambient-hero relative isolate overflow-hidden border-b border-theme-border py-24 sm:py-32 lg:py-40">
      <div aria-hidden className="ambient-wordmark pointer-events-none absolute bottom-[-0.14em] left-1/2 -translate-x-1/2 font-display text-[clamp(6rem,19vw,18rem)] leading-[.8] tracking-[-0.08em]">PAWNPAWN</div>
      <div className="page-container relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">A considered collection of stories</p>
        <h1 className="mt-5 max-w-4xl font-display text-[clamp(3.5rem,8vw,6.75rem)] leading-[.88] tracking-editorial">Wear the moment.<br /><em className="not-italic text-theme-editorial">Keep the story.</em></h1>
        <p className="mt-7 max-w-xl text-sm leading-7 text-theme-muted">One-of-one pieces from the people who made culture. Every item travels through PawnPawn HQ for authentication, certification, and care.</p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <a href="#drops" className="primary-action">Explore the drops</a>
          {featured && <Link href={`/products/${featured.id}`} className="border-b border-theme-accent pb-1 text-sm text-theme-primary transition-opacity hover:opacity-70">Featured: {featured.seller?.store_name ?? "Celebrity drop"} <span className="ml-2 text-theme-accent">↗</span></Link>}
        </div>
      </div>
    </section>

    <section id="drops" className="page-container py-16 sm:py-20 lg:py-24">
      {products.length ? <DiscoveryCatalog products={products} /> : <div className="elevated-panel border-dashed px-6 py-16 text-center"><p className="font-display text-3xl">The next drop is being prepared at PawnPawn HQ.</p><small className="mt-3 block text-xs text-theme-muted">Start the Medusa backend on port 9000 to see the live catalog.</small></div>}
    </section>

    <section id="how-it-works" className="border-y border-theme-border bg-theme-surface py-16 sm:py-20 lg:py-24">
      <div className="page-container">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Trusted from hand to hand</p>
        <div className="mt-10 grid border-t border-theme-border md:grid-cols-3">{[["01", "Celebrity drop", "Pieces enter through the people who lived their stories."], ["02", "HQ authentication", "Every purchase is received, authenticated, and certified by PawnPawn."], ["03", "Yours to continue", "Your ownership joins a transparent record that travels with the piece."]].map(([number, title, copy], index) => <div key={number} className={`py-7 ${index ? "border-t border-theme-border md:border-l md:border-t-0 md:pl-7" : "md:pr-8"}`}><span className="text-xs text-theme-muted">{number}</span><h2 className="mt-9 font-display text-3xl tracking-[-0.04em]">{title}</h2><p className="mt-3 max-w-[15rem] text-sm leading-6 text-theme-muted">{copy}</p></div>)}</div>
      </div>
    </section>
  </>
}
