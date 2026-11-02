import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../", import.meta.url)
const read = (path) => readFile(new URL(path, root), "utf8")

test("checkout creates a server-priced Stripe PaymentIntent before finalizing the Medusa purchase", async () => {
  const [checkout, cart, regionProvider, regions, environment, demoRoute] = await Promise.all([
    read("components/checkout-client.tsx"),
    read("components/cart-provider.tsx"),
    read("components/region-provider.tsx"),
    read("lib/regions.ts"),
    read(".env.example"),
    read("app/api/demo-session/route.ts"),
  ])

  for (const source of ["@stripe/react-stripe-js", "@stripe/stripe-js", "<Elements", "CardNumberElement", "CardExpiryElement", "CardCvcElement"]) {
    assert.ok(checkout.includes(source), `expected Stripe checkout source: ${source}`)
  }
  for (const source of ["/api/demo-session", "Auto-login with Demo Customer Token", "Advanced: enter a Customer token manually", "/store/payment-intent", "/store/purchase", "payment_intent_id", "confirmCardPayment", "Demo payment mode", "Complete Demo Purchase", "variant_id", "quantity: 1", "region_id: region.id", "Unavailable for Purchase"]) {
    assert.ok(checkout.includes(source), `expected checkout contract source: ${source}`)
  }
  assert.ok(!checkout.includes("createPaymentMethod"), "browser must confirm the server-created PaymentIntent instead of only creating a PaymentMethod")
  assert.ok(checkout.includes("clear(); setStatus(\"success\")"), "cart must clear only after purchase finalization succeeds")
  assert.ok(cart.includes("pawnpawn-buyer-cart:${region.id}"), "cart must be isolated per selected region")
  assert.ok(regions.includes("formatRegionalPrice"), "price display must share the regional formatter")
  assert.ok(regions.includes("en-IN") && regions.includes("en-EU"), "must support INR and EUR localized formatting")
  assert.ok(regionProvider.includes("pawn_region_id") && regionProvider.includes("sessionStorage"), "region selection must persist as cookie and session state")
  for (const setting of ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "DEMO_BUYER_EMAIL", "DEMO_BUYER_PASSWORD"]) {
    assert.ok(environment.includes(setting), `expected environment setting: ${setting}`)
  }
  assert.ok(demoRoute.includes('process.env.NODE_ENV === "production"'), "demo session route must be disabled in production")
  assert.ok(demoRoute.includes("/auth/customer/emailpass"), "demo session route must acquire the local Customer token server-side")
})
