# Buyer App API Contracts

Base URL: `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (local default
`http://localhost:9000`). All routes return JSON. The public key must be sent as
`x-publishable-api-key`.

## 1. Public catalog

### `GET /store/products`

Returns only Medusa Products whose custom Listing has
`listing_status = AVAILABLE` and whose Product is published.

| Query | Use in buyer UI |
|---|---|
| `limit`, `offset` | Pagination |
| `category_id` | Native ProductCategory filtering |
| `collection_id` | Native ProductCollection/drop filtering |
| `options` | Native options, for example `Size:M` or `Condition:Like New` |
| `region_id` | Native Medusa Region ID; local EU default is `reg_01M5J0TH63KAP4HJN34ERGDC5N`, India is `reg_01M5SGFGPPFNFBFRJQAAHRRNVA` |

Important response fields consumed by the UI:

```ts
{
  products: Array<{
    id: string
    title: string
    description?: string
    thumbnail?: string
    images?: { url: string }[]
    metadata?: { images?: string[]; item_condition?: string }
    variants: { id: string; calculated_price: { calculated_amount: number; currency_code: "eur" | "inr" } }[]
    options: { title: string; values: { value: string }[] }[]
    seller: { id: string; handle: string; store_name: string; avatar_url?: string }
    marketplace_listing: { id: string; listing_status: "AVAILABLE"; item_condition?: string }
  }>
  count: number
}
```

The buyer must not attempt to include pending, rejected, or sold inventory in
this feed. The backend also excludes an `AVAILABLE` Product with no strictly
positive calculated price in the requested Region. Apply display filtering only
as a defensive UI step; backend Listing and Pricing filtering are authoritative.

## 2. Public seller profile

### `GET /store/sellers/:handle`

Returns:

```ts
{
  seller: {
    id: string; handle: string; store_name: string; avatar_url?: string
    bio?: string; verification_status?: string; social_handles?: Record<string, string>
  }
  products: Product[] // AVAILABLE
  archive: Product[]  // SOLD
}
```

Treat a 404 or inactive profile as an unavailable route. Do not expose
deactivated-seller records.

## 3. Public ownership chain

### `GET /store/products/:id/lineage`

Returns chronological public provenance. Actual response can expose `lineage`
or `history`; `lib/medusa.ts` accepts either while the backend contract settles.

```ts
{
  lineage: Array<{
    id: string
    seller_id?: string
    buyer_id?: string // opaque; never render as a person
    price?: number
    transacted_at: string
    seller?: { handle: string; store_name: string; avatar_url?: string }
  }>
}
```

Display seller identity, date, and price only when returned. Never request or
render private shipping, payment, Admin review, or internal fulfillment fields.

## 4. Stripe checkout

For the UI-to-backend sequence and troubleshooting the Customer token prompt,
see [CHECKOUT_WORKFLOW.md](./CHECKOUT_WORKFLOW.md).

### `POST /store/payment-intent`

Headers:

```http
Content-Type: application/json
x-publishable-api-key: <publishable key>
Authorization: Bearer <customer JWT>
```

Request (the browser never supplies a price):

```json
{
  "items": [{ "variant_id": "variant_...", "quantity": 1 }],
  "region_id": "reg_01M5J0TH63KAP4HJN34ERGDC5N",
  "currency_code": "eur",
  "idempotency_key": "pawnpawn-browser-attempt-id"
}
```

The buyer always supplies native `region_id`. EU/EUR is the default and India
selects INR. The backend calculates the Medusa Price Set price for that Region,
rejects missing or zero totals with `400`, and creates a Stripe PaymentIntent
for its own amount. The idempotency key coalesces intent-creation retries.

Success (`201`):

```json
{
  "payment": {
    "payment_intent_id": "pi_...",
    "client_secret": "pi_..._secret_...",
    "amount": 120000,
    "currency_code": "eur"
  }
}
```

Confirm the `client_secret` with Stripe Elements. Never submit a client amount,
secret, or card data to the purchase endpoint.

### `POST /store/purchase`

After `stripe.confirmCardPayment` returns `status: "succeeded"`, send:

```json
{
  "items": [{ "variant_id": "variant_...", "quantity": 1 }],
  "region_id": "reg_01M5J0TH63KAP4HJN34ERGDC5N",
  "payment_intent_id": "pi_..."
}
```

The backend retrieves the PaymentIntent from Stripe and requires a matching
`succeeded` status, server-calculated amount/currency, Customer, Region, and
cart fingerprint. It locks Listings, rechecks stock, creates the order, marks
Listings sold, sets inventory to zero, and creates per-line HQ/lineage records.
Retrying finalization with the same Intent returns the existing order. Keep the
cart for `400`, `401`, `409`, Stripe, and network errors.

### Stripe Elements boundary

The Buyer app uses `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`; the backend alone
holds `STRIPE_SECRET_KEY`. In production, missing either key disables payment
fields and the purchase action. The backend's direct Stripe retrieval is the synchronous
 reconciliation gate. A signed backend Stripe webhook supplies recovery for a
 confirmed payment when a browser disconnects.

In local development only, when neither Stripe key is configured, checkout
shows **Demo payment mode** and completes a clearly simulated server-validated
purchase. It uses no card fields, never contacts Stripe, and is disabled in a
production build.

## 5. Unified password login and local demo

### `POST /auth/customer/emailpass`

```json
{ "email": "sarah.johnson@gmail.com", "password": "buyer1234" }
```

The `/login` screen submits the same request, then calls authenticated
`GET /store/seller/me`: a linked Seller opens
`NEXT_PUBLIC_SELLER_STUDIO_URL/studio`, while a buyer returns to `/`. No role
picker or URL token is used. The two apps have separate in-memory sessions.

Response includes `{ "token": "..." }`. Checkout holds this token in React
state only. The `/login` screen submits the same request directly from the
browser and keeps the JWT in current-tab React state.

## 6. CORS requirements

The backend must permit `http://localhost:3000` in Store CORS configuration and
allow `Authorization`, `Content-Type`, and `x-publishable-api-key` request
headers. The current buyer app fetches catalog data server-side and sends the
purchase request client-side, so browser checkout depends on this configuration.
