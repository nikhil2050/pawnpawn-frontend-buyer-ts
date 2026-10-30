"use client"

import { useMemo, useState } from "react"
import { ListingImage } from "@/components/listing-image"
import { ProductCard } from "@/components/product-card"
import { imageFor } from "@/lib/medusa"
import type { Product } from "@/lib/types"

const ALL_DROPS = "All Drops"

type DiscoveryCatalogProps = {
  products: Product[]
}

type CategoryModule = {
  name: string
  title: string
  copy: string
  product: Product
}

/**
 * Refines the server-provided public AVAILABLE catalog locally. It never
 * requests or exposes inventory outside Medusa's storefront response.
 * See documentation/AI_CONTEXT.md, section 4.1.
 */
export function DiscoveryCatalog({ products }: DiscoveryCatalogProps) {
  const [query, setQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState(ALL_DROPS)

  const categories = useMemo(() => {
    const names = products.flatMap((product) => product.categories?.map((category) => category.name) ?? [])
    return [ALL_DROPS, ...Array.from(new Set(names)).sort((first, second) => first.localeCompare(second))]
  }, [products])

  const categoryModules = useMemo<CategoryModule[]>(() => {
    const allDrop = products[0]
    const modules: CategoryModule[] = allDrop ? [{
      name: ALL_DROPS,
      title: "Celebrity closets",
      copy: "Explore the stories currently in circulation.",
      product: allDrop,
    }] : []

    for (const category of categories.filter((name) => name !== ALL_DROPS)) {
      const product = products.find((item) => item.categories?.some((itemCategory) => itemCategory.name === category))
      if (product) modules.push({ name: category, title: category, copy: `${category} pieces, authenticated at PawnPawn HQ.`, product })
    }

    return modules.slice(0, 4)
  }, [categories, products])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return products.filter((product) => {
      const categoryMatches = activeCategory === ALL_DROPS || product.categories?.some((category) => category.name === activeCategory)
      if (!categoryMatches) return false
      if (!normalizedQuery) return true

      const searchableText = [product.title, product.handle, product.collection?.title, product.seller?.handle, product.seller?.store_name]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase()
      return searchableText.includes(normalizedQuery)
    })
  }, [activeCategory, products, query])

  function selectCategory(category: string) {
    setActiveCategory(category)
  }

  function resetFilters() {
    setQuery("")
    setActiveCategory(ALL_DROPS)
  }

  return <div>
    <section aria-labelledby="discover-collections">
      <div className="flex items-end justify-between gap-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Explore the archive</p><h2 id="discover-collections" className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] tracking-editorial">Find your next story</h2></div><span className="hidden pb-1 text-xs text-theme-muted sm:block">Curated in small, verified drops</span></div>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{categoryModules.map((module) => <button key={module.name} type="button" onClick={() => selectCategory(module.name)} className={`group elevated-panel overflow-hidden text-left transition-[border-color,transform] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-theme-accent ${activeCategory === module.name ? "border-theme-accent" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden"><ListingImage src={imageFor(module.product)} alt="" className="size-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-105" fallbackLabel={module.title.slice(0, 1)} /><span aria-hidden className="absolute inset-0 bg-gradient-to-t from-theme-base/70 to-transparent" /></div>
        <div className="flex min-h-32 flex-col justify-between p-5"><div><h3 className="font-display text-2xl tracking-[-0.04em]">{module.title}</h3><p className="mt-2 text-xs leading-5 text-theme-muted">{module.copy}</p></div><span className="mt-4 text-sm text-theme-accent">Explore <span aria-hidden>→</span></span></div>
      </button>)}</div>
    </section>

    <section aria-label="PawnPawn guarantees" className="elevated-panel mt-12 grid divide-y divide-theme-border overflow-hidden text-sm text-theme-muted md:grid-cols-3 md:divide-x md:divide-y-0"><p className="px-5 py-4"><span className="mr-2 text-theme-accent">✓</span>Authenticated at PawnPawn HQ</p><p className="px-5 py-4"><span className="mr-2 text-theme-accent">✓</span>Insured Global Dispatch</p><p className="px-5 py-4"><span className="mr-2 text-theme-accent">✓</span>Immutable Ownership Chain</p></section>

    <section aria-labelledby="live-drops" className="mt-16">
      <div className="flex items-end justify-between gap-6"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Available now</p><h2 id="live-drops" className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] tracking-editorial">Stories in circulation</h2></div><span className="pb-1 text-xs text-theme-muted">{products.length} authenticated pieces</span></div>

      <div className="sticky top-20 z-40 mt-10 -mx-4 mb-10 border-y border-theme-border bg-theme-base/95 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <label className="sr-only" htmlFor="drop-search">Search celebrity drops</label>
        <div className="relative" role="search"><span aria-hidden className="pointer-events-none absolute inset-y-0 left-4 grid place-items-center text-theme-muted">⌕</span><input id="drop-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a piece, designer, or celebrity" className="h-12 w-full rounded-xl border border-theme-border bg-theme-surface px-11 text-sm text-theme-primary outline-none placeholder:text-theme-muted focus:border-theme-accent focus:ring-1 focus:ring-theme-accent" /></div>
        <div aria-label="Filter drops by category" className="mt-3 -mb-1 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((category) => { const active = category === activeCategory; return <button key={category} type="button" aria-pressed={active} onClick={() => selectCategory(category)} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${active ? "border-theme-accent bg-theme-accent text-theme-base" : "border-theme-border bg-theme-surface text-theme-muted hover:border-theme-accent hover:text-theme-primary"}`}>{category}</button> })}</div>
        <p aria-live="polite" className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-theme-muted">{filteredProducts.length === products.length ? `${products.length} available drops` : `${filteredProducts.length} of ${products.length} drops`}</p>
      </div>

      {filteredProducts.length ? <div className="grid grid-cols-1 gap-5 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="elevated-panel border-dashed px-6 py-16 text-center"><p className="font-display text-3xl">No celebrity pieces match your search.</p><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-theme-muted">Clear your filters to explore the current drop.</p><button type="button" onClick={resetFilters} className="mt-6 border-b border-theme-accent pb-1 text-xs font-semibold text-theme-accent transition-opacity hover:opacity-70">Reset discovery filters</button></div>}
    </section>
  </div>
}
