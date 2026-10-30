"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { backendUrl, priceFor } from "@/lib/medusa"
import { useCart } from "@/components/cart-provider"

const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"

export function CheckoutClient() {
  const { items, remove } = useCart()
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const total = useMemo(() => items.reduce((sum, item) => {
    const amount = item.variant.calculated_price?.calculated_amount ?? item.variant.prices?.[0]?.amount ?? 0
    return sum + amount
  }, 0), [items])

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

  if (status === "success") return <section className="min-h-[70vh] max-w-3xl px-6 py-28 md:px-[8vw] md:py-36"><span className="mb-7 grid size-12 place-items-center rounded-full bg-theme-accent font-bold text-theme-base">✓</span><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Payment secured</p><h1 className="font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.9] tracking-editorial">Your story is on its way.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-theme-muted">{message}</p><div className="my-9 grid gap-3 border-l border-theme-border pl-5 text-sm text-theme-muted"><span>01 · Seller sends to HQ</span><span>02 · Authenticate & certify</span><span>03 · Dispatch to you</span></div><Link href="/" className="inline-flex min-h-12 items-center bg-theme-accent px-5 text-xs font-semibold text-theme-base">Explore more drops</Link></section>

  return <section className="grid gap-12 px-6 py-20 md:grid-cols-[1.2fr_.8fr] md:gap-20 md:px-[8vw] md:py-28"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Your collection</p><h1 className="font-display text-[clamp(3.4rem,6vw,5rem)] leading-[.9] tracking-editorial">Checkout</h1>{items.length === 0 ? <div className="mt-10 border border-dashed border-theme-border px-6 py-14 text-center"><p className="font-display text-3xl">Your cart is waiting for a story.</p><Link href="/" className="mt-6 inline-flex bg-theme-accent px-5 py-3 text-xs font-semibold text-theme-base">Discover drops</Link></div> : <div className="mt-10 border-t border-theme-border">{items.map((item) => <article key={item.variant.id} className="grid grid-cols-[1fr_auto] items-center border-b border-theme-border py-6"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">{item.product.seller?.store_name ?? "Celebrity drop"}</span><h3 className="mt-2 font-display text-2xl tracking-[-0.04em]">{item.product.title}</h3><strong className="col-start-2 row-span-2 row-start-1 text-sm">{priceFor(item.product)}</strong><button type="button" onClick={() => remove(item.variant.id)} className="col-start-2 text-xs text-theme-muted transition-colors hover:text-theme-editorial">Remove</button></article>)}</div>}</div>
    {items.length > 0 && <form className="bg-theme-surface p-7 md:p-9" onSubmit={submit}><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Secure handover</p><h2 className="font-display text-5xl tracking-[-0.04em]">${(total / 100).toLocaleString()}</h2><p className="mt-4 text-sm leading-6 text-theme-muted">Payment is held while PawnPawn HQ receives, authenticates, certifies, and dispatches each item.</p><label className="mt-7 grid gap-2 text-xs text-theme-primary">Buyer session token <input value={token} onChange={(event) => setToken(event.target.value)} className="theme-input w-full border border-theme-border px-3 py-3 text-sm text-theme-primary outline-none focus:border-theme-accent" placeholder="Paste local Medusa customer token" /></label>{status === "error" && <p role="alert" className="mt-3 text-xs leading-5 text-theme-editorial">{message}</p>}<button className="mt-5 flex min-h-12 w-full items-center justify-center bg-theme-accent px-5 text-xs font-semibold text-theme-base disabled:cursor-wait disabled:opacity-70" disabled={status === "loading"}>{status === "loading" ? "Securing your drop…" : "Secure purchase"}</button></form>}
  </section>
}
