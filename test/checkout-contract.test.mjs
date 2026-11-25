import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../", import.meta.url)
const read = (path) => readFile(new URL(path, root), "utf8")

test("checkout creates a server-priced Stripe PaymentIntent before finalizing the Medusa purchase", async () => {
  const [checkout, cart, regionProvider, regions, environment, session] = await Promise.all([
    read("components/checkout-client.tsx"),
    read("components/cart-provider.tsx"),
    read("components/region-provider.tsx"),
    read("lib/regions.ts"),
    read(".env.example"),
    read("components/auth-session.tsx"),
  ])

  for (const source of ["@stripe/react-stripe-js", "@stripe/stripe-js", "<Elements", "CardNumberElement", "CardExpiryElement", "CardCvcElement"]) {
    assert.ok(checkout.includes(source), `expected Stripe checkout source: ${source}`)
  }
  for (const source of ["/store/payment-intent", "/store/purchase", "payment_intent_id", "confirmCardPayment", "Demo payment mode", "Complete Demo Purchase", "variant_id", "quantity: 1", "region_id: region.id", "Unavailable for Purchase"]) {
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
  assert.ok(checkout.includes("useBuyerSession"), "checkout must use the in-memory account session")
  assert.ok(!session.includes("localStorage") && !session.includes("sessionStorage"), "Customer token must not enter browser storage")
})

test("password login derives role from the Seller profile without a role picker or token URL", async () => {
  const [login, page, header, environment] = await Promise.all([
    read("components/login-form.tsx"),
    read("app/login/page.tsx"),
    read("components/header.tsx"),
    read(".env.example"),
  ])

  for (const source of ["/auth/customer/emailpass", "/store/seller/me", "router.replace(\"/\")", "window.location.assign", "CELEBRITY_SELLER"]) {
    assert.ok(login.includes(source), `expected role-routing source: ${source}`)
  }
  assert.ok(login.includes('new URL("/studio", sellerStudioUrl)'), "Seller redirect must use the configured external Studio origin")
  assert.ok(!login.includes("?token="), "Seller redirect must not leak bearer tokens in URLs")
  assert.ok(page.includes("LoginForm"), "login route must render the login form")
  assert.ok(environment.includes("NEXT_PUBLIC_SELLER_STUDIO_URL"), "Seller Studio destination must be configurable")
  assert.ok(header.includes("Sign out"), "header must render a Sign out button when authenticated")
  assert.ok(header.includes("{token && ("), "header cart link must be gated on the buyer token")
})

test("sign out clears the in-memory Customer session and cart, and expired sessions redirect to login", async () => {
  const [header, checkout, session] = await Promise.all([
    read("components/header.tsx"),
    read("components/checkout-client.tsx"),
    read("components/auth-session.tsx"),
  ])

  assert.ok(header.includes("handleSignOut"), "header must handle sign out")
  assert.ok(header.includes("clearSession()"), "sign out must clear the Customer session")
  assert.ok(header.includes("clear()"), "sign out must clear the temporary cart")
  assert.ok(header.includes('window.location.href = "/"'), "sign out must return to Discovery")
  assert.ok(checkout.includes("router.replace(\"/login\")"), "checkout must redirect to login when not authenticated")
  assert.ok(!session.includes("localStorage") && !session.includes("sessionStorage"), "Customer token must not enter browser storage")
})

test("add-to-cart checkout path requires authentication", async () => {
  const [addToCart, checkout] = await Promise.all([
    read("components/add-to-cart.tsx"),
    read("components/checkout-client.tsx"),
  ])
  assert.ok(addToCart.includes("useBuyerSession"), "add-to-cart must read the buyer session")
  assert.ok(addToCart.includes("window.location.href = \"/login\""), "add-to-cart must redirect unauthenticated users to login before adding")
  assert.ok(addToCart.includes('<Link href="/login"'), "add-to-cart must offer a clickable sign-in link when not authenticated")
  assert.ok(addToCart.includes("Sign in to add to collection"), "add-to-cart must prompt sign in when not authenticated")
  assert.ok(addToCart.includes("Sign in to checkout"), "add-to-cart must offer sign in when not authenticated")
  assert.ok(addToCart.includes("Continue to secure checkout"), "add-to-cart must offer checkout when authenticated")
  assert.ok(checkout.includes("router.replace(\"/login\")"), "checkout must redirect unauthenticated users to login")
})
