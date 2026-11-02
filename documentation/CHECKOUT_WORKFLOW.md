# Buyer Checkout Workflow

This document explains the complete checkout path in `pawnpawn-frontend-buyer-ts`,
from adding a one-of-one item to the local cart through the backend order,
inventory, HQ fulfillment, and lineage updates.

## 1. End-to-end flow

```text
Product detail
  → validate active-region price
  → add Variant once to region-scoped cart
  → checkout displays localized total
  → obtain Customer JWT
  → POST /store/payment-intent (server resolves regional total)
  → Stripe confirms the returned client secret
  → POST /store/purchase with succeeded payment_intent_id
  → backend retrieves and verifies Intent, then locks Listing and revalidates stock/price
  → create Medusa order
  → mark Listing SOLD and inventory 0
  → create HQ fulfillment + lineage records
  → clear cart and show HQ handover confirmation
```

The browser never decides whether an item is finally purchasable. The backend
is authoritative for Listing status, inventory, price, order creation, and
fulfillment records.

## 2. Product detail and Add to collection

The Product page is server-rendered using the currently selected native Medusa
Region ID. Its API request is effectively:

```http
GET /store/products?region_id=<eu-or-india-region-id>
x-publishable-api-key: <publishable-key>
```

The backend returns only published Products with `AVAILABLE` custom Listings
and a strictly positive calculated Variant price for that Region. The page
displays the Variant price using the Region currency (`EUR` or `INR`).

`components/add-to-cart.tsx` checks three client-side conditions:

1. A Variant exists.
2. The Listing is not `SOLD`.
3. `calculated_price.calculated_amount` is greater than zero and its currency
   matches the selected Region.

If any check fails, the Add button is replaced with an unavailable message. A
valid item is added with `{ product, variant }` and quantity is implicitly one.
The cart provider de-duplicates by `variant.id`, so repeated clicks cannot add
the same physical item twice.

## 3. Region selection and local cart

`components/region-provider.tsx` manages the active buyer Region. Detection
priority is:

1. Explicit `pawn_region_id` cookie/session selection.
2. `cf-ipcountry: IN`, which selects India.
3. Europe as the default.

The browser stores the generated Medusa Region ID because Medusa's native Store
pricing middleware validates that ID before the custom catalog route runs. The
two local Regions are:

| Region | Native ID | Currency | Locale |
|---|---|---|---|
| Europe | `reg_01M5J0TH63KAP4HJN34ERGDC5N` | EUR | `en-EU` |
| India | `reg_01M5SGFGPPFNFBFRJQAAHRRNVA` | INR | `en-IN` |

Changing the selector writes the cookie and session value, then reloads Server
Components so the catalog, Seller profile, Product detail, and prices all use
the same Region. Cart storage is also isolated by Region:

```text
pawnpawn-buyer-cart:<native-region-id>
```

This prevents an EUR item snapshot from being silently reused as an INR item,
or vice versa.

`lib/regions.ts` contains the shared formatter. It returns `Unavailable` for
missing, zero, or negative amounts; INR uses `en-IN` grouping and EUR uses
`en-EU` grouping.

## 4. Checkout UI

`app/checkout/page.tsx` renders the checkout shell and
`components/checkout-client.tsx` owns browser interaction.

### Cart summary

Each row shows the product title, celebrity store name, localized price, and a
`Remove` action. The cart is convenience state only; it does not reserve stock.
Removing an item changes local storage and does not call the backend.

### Secure handover panel

The right panel shows:

- `Secure handover` and the active Region.
- The calculated localized total, such as `€1,200` or `₹85,000`.
- The explanation that payment is held while PawnPawn HQ receives,
  authenticates, certifies, and dispatches the item.
- The Stripe card surface when a publishable Stripe key is configured.
- The Demo Session Manager.
- The primary `Pay <total> & Secure Drop` action.

If any cart item has no positive price in the active Region, the panel displays
`Item Unavailable in Region`, hides payment fields, and disables the action as
`Unavailable for Purchase`. No zero amount is sent to Stripe or Medusa.

## 5. Customer authentication

The backend requires an authenticated Customer for purchase. Without a token,
the UI displays:

> Start a Demo Session or enter a Customer session token before checkout.

This is an authentication prompt, not a payment error. For local demos, click
`Auto-login with Demo Customer Token`. The development-only
`POST /api/demo-session` Next route calls Medusa's emailpass authentication on
the server and returns a short-lived Customer JWT to the current React state.

The local buyer credentials are:

```text
Email:    sarah.johnson@gmail.com
Password: buyer1234
```

The token is never put in localStorage, URLs, logs, or public environment
variables. The `Advanced: enter a Customer token manually` disclosure is for
testing a token obtained from another local Customer session.

## 6. Stripe PaymentIntent flow

When `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` exists, checkout is wrapped in
Stripe's `Elements` provider and renders Card Number, Expiry, CVC, and Postal
Code. The browser does not create an order from a local total. It follows this
sequence after local display validation and Customer authentication:

1. Request `POST /store/payment-intent` with the Variant IDs, native Region ID,
   and a browser idempotency key. It sends no price or card data.
2. The backend uses Medusa Pricing to calculate the current Region total,
   creates Stripe's PaymentIntent for that value, and returns only the
   `client_secret`, Intent ID, amount, and currency.
3. `stripe.confirmCardPayment` submits the Card Element directly to Stripe.
4. Only when Stripe returns `succeeded`, submit `POST /store/purchase` with
   the same items, Region ID, and `payment_intent_id`.
5. The backend retrieves the Intent from Stripe and verifies its state,
   amount/currency, Customer, Region, and cart fingerprint before creating an
   order or changing Listing/inventory/HQ/lineage records.

Without both the Buyer publishable key and backend `STRIPE_SECRET_KEY`, local
development automatically shows **Demo payment mode**. It simulates a succeeded
server-validated payment so the order, HQ, and lineage journey can be shown
without a Stripe account. It never contacts Stripe or collects card data, is
clearly labelled in the UI, and is disabled when `NODE_ENV=production`.

## 7. Payment Intent request

Before card confirmation, the browser sends:

```http
POST http://localhost:9000/store/payment-intent
Content-Type: application/json
x-publishable-api-key: <publishable-key>
Authorization: Bearer <customer-jwt>
```

```json
{
  "items": [{ "variant_id": "variant_...", "quantity": 1 }],
  "region_id": "reg_01M5J0TH63KAP4HJN34ERGDC5N",
  "currency_code": "eur",
  "idempotency_key": "pawnpawn-browser-attempt-id"
}
```

## 8. Purchase finalization request

After Stripe confirms the Intent, the browser sends:

```http
POST http://localhost:9000/store/purchase
Content-Type: application/json
x-publishable-api-key: <publishable-key>
Authorization: Bearer <customer-jwt>
```

```json
{
  "items": [
    { "variant_id": "variant_...", "quantity": 1 }
  ],
  "region_id": "reg_01M5J0TH63KAP4HJN34ERGDC5N",
  "payment_intent_id": "pi_..."
}
```

The client does not send a price. The backend calculates it from the Medusa
Price Set for the requested Region.

## 9. Backend workflow

`src/api/store/payment-intent/route.ts` and `src/api/store/purchase/route.ts`
are intentionally thin. Both authenticate the Customer and map known
`PurchaseError` responses. The first creates an Intent; the second invokes
`executeStripeCheckout` and returns the order result.

`src/workflows/purchase/dummy-checkout.ts` performs the business workflow:

1. Validate that at least one item exists, each quantity is exactly `1`, and no
   Variant is duplicated in the request.
2. Resolve the requested Region and a Sales Channel. `reg_eu` / `reg_in` are
   accepted aliases inside this custom workflow; native catalog calls use
   generated Medusa IDs.
3. Resolve each Variant's custom Listing and require `AVAILABLE` status.
4. Acquire a lock for every Listing ID, sorted consistently to reduce
   deadlocks.
5. Re-read Listings and stock after lock acquisition so a competing buyer
   cannot purchase the same physical item.
6. Resolve the Product Variant to a Medusa Price Set and calculate the price
   with the active Region and currency. Missing, invalid, or zero values return
   `400` before an order is created.
7. Retrieve the supplied PaymentIntent from Stripe and require `succeeded` plus
   exact server-side amount, currency, Customer, Region, and cart fingerprint.
8. Return an existing order for a retry using the same PaymentIntent, then run
   the shared idempotent post-order handler.
9. Create the Medusa order through `createOrderWorkflow` using server-derived
   prices and the resolved native Region.
10. Run the shared order-placed lifecycle handler.

The current lock provider and post-order operations still need a durable
reservation/outbox transaction for production-scale fault recovery. Stripe
webhooks are the remaining recovery channel for asynchronous provider events;
they do not replace synchronous server verification before order creation.

## 10. Post-order lifecycle

The `order.placed` handler processes each order line independently. For every
line it:

1. Marks the custom Listing `SOLD`.
2. Drafts the native Product so it leaves the public catalog.
3. Sets the inventory level to zero while retaining the Variant SKU.
4. Creates one `hq_fulfillment` row with `WAITING_FOR_ARRIVAL`.
5. Records one `product_lineage` entry linking seller, buyer, price, and order
   line.

`order_line_item_id` is the idempotency key for HQ and lineage records. Event
retries therefore do not create duplicate fulfillment or provenance rows.

## 11. UI result and error handling

On a successful `201` response, the buyer clears only the active Region cart and
sees `Your story is on its way`, followed by:

1. Seller sends to HQ.
2. Authenticate & certify.
3. Dispatch to buyer.

The cart remains intact for safe retry on `401` authentication errors, `409`
stock/Listing conflicts, `400` validation or regional-price errors, Stripe
validation errors, and network failures. The inline backend `message` is shown
to the buyer; requests are not retried automatically.

## 12. Related source and tests

| Area | Source |
|---|---|
| Cart | `components/cart-provider.tsx` |
| Checkout UI | `components/checkout-client.tsx` |
| Region state | `components/region-provider.tsx`, `lib/regions.ts` |
| Store API client | `lib/medusa.ts` |
| Payment Intent route | backend `apps/backend/src/api/store/payment-intent/route.ts` |
| HTTP route | backend `apps/backend/src/api/store/purchase/route.ts` |
| Checkout workflow | backend `apps/backend/src/workflows/purchase/dummy-checkout.ts` |
| Order lifecycle | backend `apps/backend/src/subscribers/order-placed-hq-fulfillment.ts` |
| Buyer contract test | `test/checkout-contract.test.mjs` |
| Backend regional pricing test | `apps/backend/src/utils/__tests__/regional-pricing.unit.spec.ts` |
| Backend Intent verification test | `apps/backend/src/services/__tests__/stripe-payment.unit.spec.ts` |

Run the buyer checks with `npm run lint`, `npm test`, and `npm run build`. Run
the focused backend test with:

```bash
npm run test:unit -- --watchman=false --runTestsByPath src/utils/__tests__/regional-pricing.unit.spec.ts
```
