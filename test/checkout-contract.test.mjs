import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../", import.meta.url)
const read = (path) => readFile(new URL(path, root), "utf8")

test("checkout keeps Stripe validation, demo auth, and the Medusa purchase contract separate", async () => {
  const [checkout, cart, environment, demoRoute] = await Promise.all([
    read("components/checkout-client.tsx"),
    read("components/cart-provider.tsx"),
    read(".env.example"),
    read("app/api/demo-session/route.ts"),
  ])

  for (const source of ["@stripe/react-stripe-js", "@stripe/stripe-js", "<Elements", "CardNumberElement", "CardExpiryElement", "CardCvcElement"]) {
    assert.ok(checkout.includes(source), `expected Stripe checkout source: ${source}`)
  }
  for (const source of ["/api/demo-session", "Auto-login with Demo Customer Token", "Advanced: enter a Customer token manually", "/store/purchase", "variant_id", "quantity: 1"]) {
    assert.ok(checkout.includes(source), `expected checkout contract source: ${source}`)
  }
  assert.ok(checkout.includes("PaymentIntent"), "must disclose that live charges require a backend PaymentIntent")
  assert.ok(cart.includes("clear: () => setItems([])"), "successful checkout must clear the temporary cart")
  for (const setting of ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "DEMO_BUYER_EMAIL", "DEMO_BUYER_PASSWORD"]) {
    assert.ok(environment.includes(setting), `expected environment setting: ${setting}`)
  }
  assert.ok(demoRoute.includes('process.env.NODE_ENV === "production"'), "demo session route must be disabled in production")
  assert.ok(demoRoute.includes("/auth/customer/emailpass"), "demo session route must acquire the local Customer token server-side")
})
