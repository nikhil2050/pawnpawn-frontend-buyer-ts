"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CardCvcElement, CardExpiryElement, CardNumberElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useCart } from "@/components/cart-provider"
import { backendUrl, priceFor } from "@/lib/medusa"
import { formatRegionalPrice, isValidRegionalPrice } from "@/lib/regions"
import { useRegion } from "@/components/region-provider"
import { useBuyerSession } from "@/components/auth-session"

const medusaKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ?? "pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4"
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
const stripePromise = stripeKey ? loadStripe(stripeKey) : null
const createCheckoutAttemptId = () => {
  const uuid = globalThis.crypto?.randomUUID?.()
  return `pawnpawn-${uuid ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
}

const stripeElementStyle = {
  base: { color: "#f5f1ec", fontFamily: "Arial, Helvetica, sans-serif", fontSize: "16px", "::placeholder": { color: "#a49d96" } },
  invalid: { color: "#ff7c8d" },
}

type CheckoutStatus = "idle" | "loading" | "success" | "error"
type PaymentIntentPayload = {
  payment?: {
    payment_intent_id?: string
    client_secret?: string
    amount?: number
    currency_code?: string
    provider?: "stripe" | "demo"
  }
  message?: string
}

export function CheckoutClient() {
  const stripeEnabled = Boolean(stripeKey)
  // Development-only investor path when no Stripe account keys are present.
  // Production always requires Stripe; see documentation/CHECKOUT_WORKFLOW.md.
  const demoPaymentEnabled = process.env.NODE_ENV !== "production" && !stripeEnabled
  return <Elements stripe={stripePromise}><CheckoutContent stripeEnabled={stripeEnabled} demoPaymentEnabled={demoPaymentEnabled} /></Elements>
}

function CheckoutContent({ stripeEnabled, demoPaymentEnabled }: { stripeEnabled: boolean; demoPaymentEnabled: boolean }) {
  const { items, remove, clear } = useCart()
  const { region } = useRegion()
  const stripe = useStripe()
  const elements = useElements()
  const { token, startSession, clearSession } = useBuyerSession()
  const router = useRouter()

  useEffect(() => {
    if (!token.trim()) router.replace("/login")
  }, [token, router])

  const [status, setStatus] = useState<CheckoutStatus>("idle")
  const [message, setMessage] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [serverAmount, setServerAmount] = useState<number | null>(null)
  const checkoutAttemptId = useMemo(() => createCheckoutAttemptId(), [])
  const hasUnavailableItem = useMemo(() => items.some((item) => !isValidRegionalPrice(
    item.variant.calculated_price?.calculated_amount,
    item.variant.calculated_price?.currency_code,
    region
  )), [items, region])
  const total = useMemo(() => items.reduce((sum, item) => sum + (item.variant.calculated_price?.calculated_amount ?? 0), 0), [items])
  const hasRegionalPrice = items.length > 0 && !hasUnavailableItem && total > 0
  const purchaseable = hasRegionalPrice && (stripeEnabled || demoPaymentEnabled)
  const formattedTotal = formatRegionalPrice(serverAmount ?? total, region.currencyCode)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!hasRegionalPrice) { setStatus("error"); setMessage("Item Unavailable in Region. Select a region where every item has a valid price."); return }
    if (!stripeEnabled && !demoPaymentEnabled) { setStatus("error"); setMessage("Stripe checkout is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY and the backend STRIPE_SECRET_KEY."); return }
    if (!token.trim()) { setStatus("error"); setMessage("Sign in at /login or enter a Customer session token before checkout."); return }
    setStatus("loading"); setMessage("")
    try {
      // The server resolves the Price Set total and creates an Intent before
      // Stripe sees any card data. See documentation/CHECKOUT_WORKFLOW.md.
      const intentResponse = await fetch(`${backendUrl}/store/payment-intent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-publishable-api-key": medusaKey, authorization: `Bearer ${token.trim()}` },
        body: JSON.stringify({
          items: items.map((item) => ({ variant_id: item.variant.id, quantity: 1 })),
          region_id: region.id,
          currency_code: region.currencyCode,
          idempotency_key: checkoutAttemptId,
        }),
      })
      if (intentResponse.status === 401) { clearSession(); router.replace("/login"); return }
      const intentPayload = await intentResponse.json().catch(() => ({})) as PaymentIntentPayload
      const payment = intentPayload.payment
      if (!intentResponse.ok || !payment?.payment_intent_id || !payment.amount || payment.amount <= 0) {
        throw new Error(intentPayload.message ?? "Stripe payment could not be initialized.")
      }
      setServerAmount(payment.amount)
      if (payment.provider !== "demo") {
        if (!stripe || !elements) throw new Error("Stripe is still loading. Please try again.")
        const card = elements.getElement(CardNumberElement)
        if (!card || !payment.client_secret) throw new Error("Enter your card details before securing this drop.")
        const confirmation = await stripe.confirmCardPayment(payment.client_secret, {
          payment_method: {
            card,
            billing_details: { address: { postal_code: postalCode || undefined } },
          },
        })
        if (confirmation.error) throw new Error(confirmation.error.message ?? "Stripe declined this card.")
        if (confirmation.paymentIntent?.status !== "succeeded") {
          throw new Error("Stripe payment is not complete yet. Please try again.")
        }
      }
      const response = await fetch(`${backendUrl}/store/purchase`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-publishable-api-key": medusaKey, authorization: `Bearer ${token.trim()}` },
        body: JSON.stringify({
          items: items.map((item) => ({ variant_id: item.variant.id, quantity: 1 })),
          region_id: region.id,
          currency_code: region.currencyCode,
          payment_intent_id: payment.payment_intent_id,
        }),
      })
      if (response.status === 401) { clearSession(); router.replace("/login"); return }
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message ?? "Checkout could not be completed.")
      clear(); setStatus("success")
      setMessage(`Order ${payload.order?.display_id ?? "confirmed"} is secure. Your piece now travels to PawnPawn HQ for authentication, certification, and dispatch.`)
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Checkout could not be completed.")
    }
  }

  if (status === "success") return <CheckoutSuccess message={message} />

  return <section className="page-container grid gap-8 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,.8fr)] lg:gap-12 lg:py-20"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Your collection</p><h1 className="mt-3 font-display text-[clamp(3.4rem,6vw,5rem)] leading-[.9] tracking-editorial">Checkout</h1>{items.length === 0 ? <div className="elevated-panel mt-10 px-6 py-14 text-center"><p className="font-display text-3xl">Your cart is waiting for a story.</p><Link href="/" className="primary-action mt-6">Discover drops</Link></div> : <div className="elevated-panel mt-10 overflow-hidden">{items.map((item) => <article key={item.variant.id} className="grid grid-cols-[1fr_auto] items-center border-b border-theme-border px-5 py-6 last:border-b-0"><span className="text-[10px] font-bold uppercase tracking-[0.14em] text-theme-accent">{item.product.seller?.store_name ?? "Celebrity drop"}</span><h2 className="mt-2 font-display text-2xl tracking-[-0.04em]">{item.product.title}</h2><strong className="col-start-2 row-span-2 row-start-1 font-display text-xl">{priceFor(item.product)}</strong><button type="button" onClick={() => remove(item.variant.id)} className="col-start-2 text-xs text-theme-muted transition-colors hover:text-theme-editorial">Remove</button></article>)}</div>}</div>
    {items.length > 0 && <form className="elevated-panel h-fit p-7 md:p-9" onSubmit={submit}><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Secure handover · {region.label}</p><h2 className="mt-3 font-display text-5xl tracking-[-0.04em]">{formattedTotal}</h2><p className="mt-4 text-sm leading-6 text-theme-muted">{demoPaymentEnabled ? "Demo payment validates the server-calculated amount. PawnPawn HQ then receives, authenticates, certifies, and dispatches each item." : "Stripe confirms the server-calculated amount. PawnPawn HQ then receives, authenticates, certifies, and dispatches each item."}</p>{!hasRegionalPrice && <p role="alert" className="mt-4 rounded-lg border border-theme-editorial px-3 py-3 text-sm text-theme-editorial">Item Unavailable in Region. A non-zero local price is required before checkout.</p>}<PaymentSurface enabled={hasRegionalPrice} stripeEnabled={stripeEnabled} demoPaymentEnabled={demoPaymentEnabled} postalCode={postalCode} onPostalCodeChange={setPostalCode} /><p className="mt-5 text-xs leading-5 text-theme-muted">{demoPaymentEnabled ? "Development demo payment is simulated and never contacts Stripe." : "Your card is confirmed through Stripe. PawnPawn creates the order only after the backend verifies the succeeded PaymentIntent."}</p>{status === "error" && <p role="alert" className="mt-3 text-xs leading-5 text-theme-editorial">{message}</p>}{status === "idle" && message && <p role="status" className="mt-3 text-xs leading-5 text-theme-accent">{message}</p>}<button className="primary-action mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50" disabled={!purchaseable || status === "loading"}>{status === "loading" ? "Confirming secure payment…" : !hasRegionalPrice ? "Unavailable for Purchase" : demoPaymentEnabled ? `Complete Demo Purchase · ${formattedTotal}` : `Pay ${formattedTotal} & Secure Drop`}</button></form>}
  </section>
}

function PaymentSurface({ enabled, stripeEnabled, demoPaymentEnabled, postalCode, onPostalCodeChange }: { enabled: boolean; stripeEnabled: boolean; demoPaymentEnabled: boolean; postalCode: string; onPostalCodeChange: (value: string) => void }) {
  if (!enabled) return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Payment unavailable</p><p className="mt-3 text-sm leading-6 text-theme-muted">Choose a region where this one-of-one piece has an active non-zero price to continue.</p></section>
  if (demoPaymentEnabled) return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Demo payment mode</p><p className="mt-3 text-sm leading-6 text-theme-muted">No Stripe account is configured. This development-only flow simulates a succeeded payment so the full PawnPawn order, HQ, and lineage journey can be demonstrated.</p></section>
  if (!stripeEnabled) return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Stripe checkout unavailable</p><p className="mt-3 text-sm leading-6 text-theme-muted">Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the Buyer app and `STRIPE_SECRET_KEY` in the backend. No card data is collected until both are configured.</p></section>
  return <section className="mt-7 rounded-xl border border-theme-border bg-theme-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-theme-primary">Card details</p><div className="mt-4 grid gap-4"><StripeField label="Card number"><CardNumberElement options={{ style: stripeElementStyle, placeholder: "1234 1234 1234 1234" }} /></StripeField><div className="grid gap-4 sm:grid-cols-2"><StripeField label="Expiry date"><CardExpiryElement options={{ style: stripeElementStyle }} /></StripeField><StripeField label="CVC"><CardCvcElement options={{ style: stripeElementStyle }} /></StripeField></div><label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">Postal code<input value={postalCode} onChange={(event) => onPostalCodeChange(event.target.value)} autoComplete="postal-code" className="theme-input rounded-lg border border-theme-border px-3 py-3 text-sm normal-case tracking-normal text-theme-primary outline-none focus:border-theme-accent" placeholder="10115" /></label></div></section>
}

function StripeField({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-theme-muted">{label}<span className="rounded-lg border border-theme-border bg-theme-base px-3 py-[15px] normal-case tracking-normal">{children}</span></label>
}

function CheckoutSuccess({ message }: { message: string }) {
  return <section className="page-container py-24 sm:py-32"><div className="elevated-panel max-w-3xl p-7 sm:p-10"><span className="grid size-12 place-items-center rounded-full bg-theme-accent font-bold text-theme-base">✓</span><p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] text-theme-accent">Payment secured</p><h1 className="mt-3 font-display text-[clamp(3.4rem,7vw,6rem)] leading-[.9] tracking-editorial">Your story is on its way.</h1><p className="mt-7 max-w-2xl text-lg leading-8 text-theme-muted">{message}</p><div className="my-9 grid gap-3 border-l border-theme-border pl-5 text-sm text-theme-muted"><span>01 · Seller sends to HQ</span><span>02 · Authenticate &amp; certify</span><span>03 · Dispatch to you</span></div><Link href="/" className="primary-action">Explore more drops</Link></div></section>
}
