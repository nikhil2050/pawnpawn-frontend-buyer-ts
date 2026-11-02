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
    variants: { id: string; prices?: { amount: number; currency_code: string }[] }[]
    options: { title: string; values: { value: string }[] }[]
    seller: { id: string; handle: string; store_name: string; avatar_url?: string }
    marketplace_listing: { id: string; listing_status: "AVAILABLE"; item_condition?: string }
  }>
  count: number
}
```

The buyer must not attempt to include pending, rejected, or sold inventory in
this feed. Apply display filtering only as a defensive UI step; backend Listing
filtering is authoritative.

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

## 4. MVP checkout

### `POST /store/purchase`

Headers:

```http
Content-Type: application/json
x-publishable-api-key: <publishable key>
Authorization: Bearer <customer JWT>
```

Request:

```json
{
  "items": [{ "variant_id": "variant_...", "quantity": 1 }]
}
```

The backend may select default region and sales channel. Future UI can supply
`region_id`, `sales_channel_id`, and `shipping_address` after address capture is
implemented.

On success (`201`):

```json
{
  "order": { "id": "order_...", "display_id": 1 },
  "payment": { "status": "CAPTURED", "provider": "dummy" },
  "fulfillment": { "status": "WAITING_FOR_ARRIVAL", "per_line_item": true }
}
```

The client must submit only one of each unique Variant. Backend locks the
Listing, rechecks availability/stock, calculates price, creates the order,
marks the Listing sold, sets stock to zero, and creates line-item HQ/lineage
records. Handle `401`, `409`, and validation `400` responses by showing the
backend `message`; do not retry automatically.

### Stripe Elements demo boundary

The Buyer app can mount Stripe Card Elements when
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is configured. It creates a Stripe
PaymentMethod only to validate browser card input before submitting the existing
dummy purchase request. It does **not** create or confirm a charge: that needs
a backend endpoint which creates a PaymentIntent, returns its client secret,
and reconciles the webhook/payment status before fulfillment. Until that
contract exists, the backend's `payment.provider = "dummy"` remains the source
of truth for the investor-demo checkout.

## 5. Customer login used by local demo

### `POST /auth/customer/emailpass`

```json
{ "email": "sarah.johnson@gmail.com", "password": "buyer1234" }
```

Response includes `{ "token": "..." }`. Checkout holds this token in React
state only. In development, the Demo Session Manager calls the local Next route
`POST /api/demo-session`; that route calls emailpass with server-only demo
credentials and returns a fresh token. It is disabled in production, never
embeds a JWT or password in browser code, and manual token entry remains in an
advanced disclosure.

## 6. CORS requirements

The backend must permit `http://localhost:3000` in Store CORS configuration and
allow `Authorization`, `Content-Type`, and `x-publishable-api-key` request
headers. The current buyer app fetches catalog data server-side and sends the
purchase request client-side, so browser checkout depends on this configuration.
