"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useCart } from "@/components/cart-provider"
import { backendUrl, priceFor } from "@/lib/medusa"

const medusaKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const stripeElementStyle = {
  base: { color: "#f5f1ec", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "16px", "::placeholder": { color: "#a49d96" } },
  invalid: { color: "#ff7c8d" },
}

type CheckoutStatus = "idle" | "loading" | "success" | "error"

export function CheckoutClient() {
  return <Elements stripe={stripePromise}><CheckoutContent stripeEnabled={Boolean(stripeKey)} /></Elements>
}

function CheckoutContent({ stripeEnabled }: { stripeEnabled: boolean }) {
  const { items, remove, clear } = useCart()
  const stripe = useStripe()
  const elements = useElements()
  const [token, setToken] = useState("")
  const [demoLoading, setDemoLoading] = useState(false)
  const [status, setStatus] = useState<CheckoutStatus>("idle")
  const [message, setMessage] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.variant.calculated_price?.calculated_amount ?? item.variant.prices?.[0]?.amount ?? 0), 0), [items])
  const currency = items[0]?.variant.calculated_price?.currency_code ?? items[0]?.variant.prices?.[0]?.currency_code ?? "usd"
  const formattedTotal = new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(total / 100)

  async function autoLogin() {
    setDemoLoading(true); setMessage("")
    try {
      // Local-investor helper only. See documentation/AI_CONTEXT.md#checkout.
      // The short-lived JWT is returned directly to React state and never stored.
      const response = await fetch("/api/demo-session", { method: "POST" })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.token) throw new Error(payload.message ?? "Demo login could not start.")
      setToken(payload.token); setMessage("Demo buyer session is ready for this checkout.")
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Demo login could not start.")
    } finally { setDemoLoading(false) }
  }

  async function validateStripeCard() {
    if (!stripeEnabled) return
    if (!stripe || !elements) throw new Error("Stripe is still loading. Please try again.")
    const card = elements.getElement(CardNumberElement)
    if (!card) throw new Error("Enter your card details before securing this drop.")
    // The MVP has no backend PaymentIntent endpoint. Creating a PaymentMethod
    // validates Stripe Elements without claiming that a live charge was made.
    // See documentation/API.md#stripe-elements-demo-boundary.
    const result = await stripe.createPaymentMethod({ type: "card", card, billing_details: { address: { postal_code: postalCode || undefined } } })
    if (result.error) throw new Error(result.error.message ?? "Stripe could not validate these card details.")
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token.trim()) { setStatus("error"); setMessage("Start a Demo Session or enter a Customer session token before checkout."); return }
    setStatus("loading"); setMessage("")
    try {
      await validateStripeCard()
      const response = await fetch(`${backendUrl}/store/purchase`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-publishable-api-key": medusaKey, authorization: `Bearer ${token.trim()}` },
        body: JSON.stringify({ items: items.map((item) => ({ variant_id: item.variant.id, quantity: 1 })) }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message ?? "Checkout could not be completed.")
      clear(); setStatus("success")
      setMessage(`Order ${payload.order?.display_id ?? "confirmed"} is secure. Your piece now travels to PawnPawn HQ for authentication, certification, and dispatch.`)
    } catch (error) {
      setStatus("error"); setMessage(error instanceof Error ? error.message : "Checkout could not be completed.")
    }
  }

  if (status === "success") return <CheckoutSuccess message={message} />

  return <section className="page-container grid gap-8 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)] lg:gap-12 lg:py-20"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Your collection</p><h1 className="mt-3 font-display text-[clamp(3.4rem,6vw,5rem)] leading-[.9] tracking-editorial">Checkout</h1>{items.length === 0 ? <div className="elevated-panel mt-10 px-6 py-14 text-center"><p className="font-display text-3xl">Your cart is waiting for a story.</p><Link href="/" className="primary-action mt-6">Discover drops</Link></div> : <div className="elevated-panel mt-10 overflow-hidden">{items.map((item) => <article key={item.variant.id} className="grid grid-cols-[1fr_auto] items-center border-b border-theme-border px-5 py-6 last:border-b-0"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">{item.product.seller?.store_name ?? "Celebrity drop"}</span><h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">{item.product.title}</h2><strong className="col-start-2 row-span-2 row-start-1 font-display text-xl">{priceFor(item.product)}</strong><button type="button" onClick={() => remove(item.variant.id)} className="col-start-2 text-xs text-theme-muted transition-colors hover:text-theme-editorial">Remove</button></article>)}</div>}</div>
    {items.length > 0 && <form className="elevated-panel h-fit p-7 md:p-9" onSubmit={submit}><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Secure handover</p><h2 className="mt-3 font-display text-5xl tracking-[-0.04em]">{formattedTotal}</h2><p className="mt-4 text-sm leading-6 text-theme-muted">Payment is held while PawnPawn HQ receives, authenticates, certifies, and dispatches each item.</p><PaymentSurface stripeEnabled={stripeEnabled} postalCode={postalCode} onPostalCodeChange={setPostalCode} /><DemoSessionManager token={token} onAutoLogin={autoLogin} loading={demoLoading} onTokenChange={setToken} /><p className="mt-5 text-xs leading-5 text-theme-muted">{stripeEnabled ? "Stripe securely validates card details. This MVP does not create a live Stripe charge until the backend provides a PaymentIntent." : "Demo payment preview is active because no Stripe publishable key is configured. No card data is collected."}</p>{status === "error" && <p role="alert" className="mt-3 text-xs leading-5 text-theme-editorial">{message}</p>}{status === "idle" && message && <p role="status" className="mt-3 text-xs leading-5 text-theme-accent">{message}</p>}<button className="primary-action mt-5 w-full disabled:cursor-wait disabled:opacity-70" disabled={status === "loading" || demoLoading}>{status === "loading" ? "Securing your drop…" : `Pay ${formattedTotal} & Secure Drop`}</button></form>}
  </section>
}

function PaymentSurface({ stripeEnabled, postalCode, onPostalCodeChange }: { stripeEnabled: boolean; postalCode: string; onPostalCodeChange: (value: string) => void }) {
  if (!stripeEnabled) return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Payment details</p><p className="mt-3 text-sm leading-6 text-theme-muted">Stripe Elements will appear when `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is configured. Demo checkout can continue without collecting payment data.</p></section>
  return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Card details</p><div className="mt-4 grid gap-4"><StripeField label="Card number"><CardNumberElement options={{ style: stripeElementStyle, placeholder: "1234 1234 1234 1234" }} /></StripeField><div className="grid gap-4 sm:grid-cols-2"><StripeField label="Expiry date"><CardExpiryElement options={{ style: stripeElementStyle }} /></StripeField><StripeField label="CVC"><CardCvcElement options={{ style: stripeElementStyle }} /></StripeField></div><label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">Postal code<input value={postalCode} onChange={(event) => onPostalCodeChange(event.target.value)} autoComplete="postal-code" className="theme-input rounded-lg border border-theme-border px-3 py-3 text-sm normal-case tracking-normal text-theme-primary outline-none focus:border-theme-accent" placeholder="10115" /></label></div></section>
}

function StripeField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">{label}<span className="rounded-lg border border-theme-border bg-theme-base px-3 py-[15px] normal-case tracking-normal">{children}</span></label>
}

function DemoSessionManager({ token, onAutoLogin, loading, onTokenChange }: { token: string; onAutoLogin: () => Promise<void>; loading: boolean; onTokenChange: (value: string) => void }) {
  return <section className="mt-5 rounded-xl border border-theme-border bg-theme-base p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-accent">Demo Session Manager</p><p className="mt-1 text-xs leading-5 text-theme-muted">Local investor demo only. A Customer token stays in this tab.</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${token ? "bg-theme-accent text-theme-base" : "border border-theme-border text-theme-muted"}`}>{token ? "Ready" : "Required"}</span></div><button type="button" className="secondary-action mt-4 w-full !min-h-11" disabled={loading} onClick={onAutoLogin}>{loading ? "Starting Demo Session…" : "Auto-login with Demo Customer Token"}</button><details className="mt-4 border-t border-theme-border pt-4"><summary className="cursor-pointer text-xs text-theme-muted">Advanced: enter a Customer token manually</summary><label className="mt-3 grid gap-2 text-xs text-theme-muted">Customer session token<input value={token} onChange={(event) => onTokenChange(event.target.value)} className="theme-input rounded-lg border border-theme-border px-3 py-3 text-sm text-theme-primary outline-none focus:border-theme-accent" placeholder="Paste local Medusa customer token" /></label></details></section>
}

function CheckoutSuccess({ message }: { message: string }) {
  return <section className="page-container py-24 sm:py-32"><div className="elevated-panel max-w-3xl p-7 sm:p-10"><span className="grid size-12 place-items-center rounded-full bg-theme-accent font-bold text-theme-base">✓</span><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Payment secured</p><h1 className="mt-3 font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.9] tracking-editorial">Your story is on its way.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-theme-muted">{message}</p><div className="my-9 grid gap-3 border-l border-theme-border pl-5 text-sm text-theme-muted"><span>01 · Seller sends to HQ</span><span>02 · Authenticate &amp; certify</span><span>03 · Dispatch to you</span></div><Link href="/" className="primary-action">Explore more drops</Link></div></section>
}
