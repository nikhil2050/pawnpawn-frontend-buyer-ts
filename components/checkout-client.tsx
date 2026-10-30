"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { backendUrl, priceFor } from "@/lib/medusa"

const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"

export function CheckoutClient() {
  const { items, remove } = useCart()
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.variant.calculated_price?.calculated_amount ?? item.variant.prices?.[0]?.amount ?? 0), 0), [items])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!token.trim()) { setStatus("error"); setMessage("Enter a buyer session token from the local Medusa login to run the protected demo checkout."); return }
    setStatus("loading")
    const response = await fetch(`${backendUrl}/store/purchase`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-publishable-api-key": key, authorization: `Bearer ${token.trim()}` },
      body: JSON.stringify({ items: items.map((item) => ({ variant_id: item.variant.id, quantity: 1 })) }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) { setStatus("error"); setMessage(payload.message ?? "Checkout could not be completed."); return }
    setStatus("success")
    setMessage(`Order ${payload.order?.display_id ?? "confirmed"} is secure. Your piece now travels to PawnPawn HQ for authentication, certification, and dispatch.`)
  }

  if (status === "success") return <section className="page-container py-24 sm:py-32"><div className="elevated-panel max-w-3xl p-7 sm:p-10"><span className="grid size-12 place-items-center rounded-full bg-theme-accent font-bold text-theme-base">✓</span><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Payment secured</p><h1 className="mt-3 font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.9] tracking-editorial">Your story is on its way.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-theme-muted">{message}</p><div className="my-9 grid gap-3 border-l border-theme-border pl-5 text-sm text-theme-muted"><span>01 · Seller sends to HQ</span><span>02 · Authenticate &amp; certify</span><span>03 · Dispatch to you</span></div><Link href="/" className="primary-action">Explore more drops</Link></div></section>

  return <section className="page-container grid gap-8 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)] lg:gap-12 lg:py-20"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Your collection</p><h1 className="mt-3 font-display text-[clamp(3.4rem,6vw,5rem)] leading-[.9] tracking-editorial">Checkout</h1>{items.length === 0 ? <div className="elevated-panel mt-10 px-6 py-14 text-center"><p className="font-display text-3xl">Your cart is waiting for a story.</p><Link href="/" className="primary-action mt-6">Discover drops</Link></div> : <div className="elevated-panel mt-10 overflow-hidden">{items.map((item) => <article key={item.variant.id} className="grid grid-cols-[1fr_auto] items-center border-b border-theme-border px-5 py-6 last:border-b-0"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">{item.product.seller?.store_name ?? "Celebrity drop"}</span><h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">{item.product.title}</h2><strong className="col-start-2 row-span-2 row-start-1 font-display text-xl">{priceFor(item.product)}</strong><button type="button" onClick={() => remove(item.variant.id)} className="col-start-2 text-xs text-theme-muted transition-colors hover:text-theme-editorial">Remove</button></article>)}</div>}</div>
    {items.length > 0 && <form className="elevated-panel h-fit p-7 md:p-9" onSubmit={submit}><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Secure handover</p><h2 className="mt-3 font-display text-5xl tracking-[-0.04em]">${(total / 100).toLocaleString()}</h2><p className="mt-4 text-sm leading-6 text-theme-muted">Payment is held while PawnPawn HQ receives, authenticates, certifies, and dispatches each item.</p><label className="mt-7 grid gap-2 text-xs text-theme-primary">Buyer session token <input value={token} onChange={(event) => setToken(event.target.value)} className="theme-input w-full rounded-xl border border-theme-border px-3 py-3 text-sm text-theme-primary outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent" placeholder="Paste local Medusa customer token" /></label>{status === "error" && <p role="alert" className="mt-3 text-xs leading-5 text-theme-editorial">{message}</p>}<button className="primary-action mt-5 w-full disabled:cursor-wait disabled:opacity-70" disabled={status === "loading"}>{status === "loading" ? "Securing your drop…" : "Secure purchase"}</button></form>}
  </section>
}
