# PawnPawn Buyer App Context

> Token-optimized context for contributors and agents. Updated: 2026-10-31.

## 1. Purpose and boundaries

PawnPawn is a hub-and-spoke celebrity-to-fan marketplace. A celebrity submits a
unique item; Admin approves it; a fan buys it; PawnPawn HQ authenticates,
certifies, packs, and dispatches it. This repository is the public buyer
experience for an investor demo.

### Design intent and audience

PawnPawn serves **Culture Collectors & Superfans**: Gen Z to Millennial (21–40)
digital-native urban professionals with disposable income who value pop culture,
archival fashion, music, scarcity, and status. The buyer experience must feel
like a high-end editorial gallery, not a crowded resale catalogue. It earns
trust by making celebrity storytelling, one-of-one rarity, HQ authentication,
and public provenance easy to understand. It directly addresses fear of
counterfeits, opaque ownership history, and impersonal/cluttered resale flows.

### Visual identity tokens

The visual system is **Modern Luxury Editorial**: gallery restraint, photography
focus, subdued dark surfaces, generous whitespace, thin separators, and subtle
ambient warm/lime hero light. The current implementation uses Tailwind CSS
utilities backed by the CSS variables below.

| Token | CSS | Tailwind-compatible utility |
|---|---|---|
| Base | `#12100f` | `bg-[#12100f]` |
| Panel | `#1a1715` | `bg-[#1a1715]` |
| Primary text | `#f5f1ec` | `text-[#f5f1ec]` |
| Muted text | `#a49d96` | `text-[#a49d96]` |
| Primary/lime | `#d8ff59` | `bg-[#d8ff59]`, `text-[#d8ff59]` |
| Editorial/coral | `#ff7c8d` | `text-[#ff7c8d]` |

Display type uses Georgia-style serif; functional UI uses system sans-serif.
Prefer `border-white/10` hairlines and generous `py-24` / `space-y-12` rhythm.

| This app owns | Backend owns |
|---|---|
| Discovery UI, seller/product views, provenance presentation, local cart, checkout request UI | Medusa Products/Variants/prices, Seller/Listing mapping, availability, stock, server-priced Stripe PaymentIntents, orders, HQ fulfillment, lineage |

**Source of truth:** custom backend `listing` records map `listing.product_id`
to `listing.seller_id`. Do not infer seller ownership or listing lifecycle from
Product metadata.

## 2. Runtime and environment

| Item | Value |
|---|---|
| Framework | Next.js 16.4.3, React 19, TypeScript, App Router |
| Buyer URL | `http://localhost:3000` |
| Backend URL | `http://localhost:9000` (configurable) |
| Environment | `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SELLER_STUDIO_URL` |
| Public key default | `pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4` |
| Validation | `npm run lint`, `npm run build` |

### Local demo credentials

These accounts are for local development only. The `/login` screen uses the
same Medusa Customer email/password route and keeps its JWT only in React
memory for the current tab.

| Role | Email | Password | Notes |
|---|---|---|---|
| Buyer | `sarah.johnson@gmail.com` | `buyer1234` | Sample buyer; reseller profile is disabled in the original-seller MVP |
| Buyer | `mike.chen@outlook.com` | `buyer1234` | Sample buyer |
| Buyer | `emily.rodriguez@yahoo.com` | `buyer1234` | Sample buyer |
| Buyer | `james.wilson@icloud.com` | `buyer1234` | Sample buyer |
| Buyer | `olivia.martinez@gmail.com` | `buyer1234` | Sample buyer |

The Seller Studio demo login is documented in the Seller repository context:
`emma.watson@pawnpawn.demo` / `seller1234` (`@emmawatson`, Emma Watson Archive).

`NEXT_PUBLIC_*` values are browser-visible. They must contain only the public
backend URL and Medusa publishable key; never put a buyer token or secret there.

### Theme architecture

`app/globals.css` is the sole theme source. Four core variables define the
entire presentation: `--theme-bg-base`, `--theme-text-primary`,
`--theme-accent`, and `--theme-editorial`. Derived `surface`, `muted`, and
`border` values use `color-mix` from those variables, so changing the four core
tokens re-themes the app. `tailwind.config.ts` maps them to `bg-theme-base`,
`bg-theme-surface`, `text-theme-primary`, `text-theme-muted`,
`bg-theme-accent`, and `border-theme-border`.

The header theme-toggle simulation changes only these variables through
`data-theme="light"` and persists the presentation preference under
`pawnpawn-theme`. It never changes the marketplace data model or API behavior.

`app/globals.css` also defines the shared visual primitives: `.page-container`
(`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`), `.elevated-panel` (surface,
theme-border, rounded-xl), and `.primary-action` (lime, rounded-xl, focus
outline). Use them for every page, persistent shell element, card, and primary
action rather than duplicating visual values.

### Global shell

- `Header` is sticky, links to Drops/How it works and Checkout, and exposes the
  number of distinct local-cart Variants. Its presentation-only theme toggle is
  client-side; marketplace data remains server-owned.
- Pages fetch catalog/profile/lineage data as Server Components. Small client
  boundaries own interactive state only: search filters, gallery selection,
  cart count, add-to-cart state, and checkout form state.

## 3. Code map

```text
app/
  page.tsx                    Discovery feed (/)
  sellers/[handle]/page.tsx   Public seller profile and sold archive
  products/[id]/page.tsx      Product detail and ownership chain
  checkout/page.tsx           Cart checkout shell
  login/page.tsx              Unified password login
  globals.css                 Premium responsive design system
  loading.tsx                 Discovery loading skeleton
  products/[id]/loading.tsx   Product loading skeleton
  sellers/[handle]/loading.tsx Seller loading skeleton
components/
  add-to-cart.tsx             One-Variant collection action and checkout link
  cart-provider.tsx           Browser-only temporary cart
  auth-session.tsx            Current-tab Customer token and derived role
  checkout-client.tsx         Protected checkout interaction
  login-form.tsx              Password sign-in and role routing
  discovery-catalog.tsx       Client search and native-category filter controls
  header.tsx                  Sticky navigation, theme simulation, cart count
  listing-image.tsx           External image failure fallback
  product-gallery.tsx         Client-side thumbnail gallery selection
  product-accordions.tsx      Accessible below-the-fold item dossier and lineage
  product-card.tsx            Discovery/profile product card
  lineage-timeline.tsx        Public provenance timeline
lib/
  medusa.ts                   Store API client and display helpers
  types.ts                    UI contracts for backend payloads
tailwind.config.ts            CSS-variable-backed Tailwind theme map
postcss.config.js             Tailwind and Autoprefixer pipeline
```

Pages are server components by default. Cart state, header count, add-to-cart,
and checkout are client components. `lib/medusa.ts` uses no-cache-style
revalidation (`revalidate: 0`) so demos reflect Admin decisions immediately.

## 4. Screens and behavior

### 4.1 Discovery `/`

- Calls `GET /store/products?limit=48` with `x-publishable-api-key`.
- The backend returns only published Products with `AVAILABLE` Listings.
- Cards show a `HQ Verified` overlay, title, lime linked Seller handle, bold
  serif price, and a right-aligned uppercase condition pill. Image and accent
  border transitions use a 300ms cubic-bezier curve without obscuring photography.
- The homepage begins with the editorial hero, followed by data-driven category
  modules that set the active native category, an HQ guarantee ticker, and the
  live-drop feed. Category modules use only public catalog data; there is no
  invented archive or hidden inventory view.
- A sticky client-side search filters this already public catalog by Product
  title/handle, drop Collection title, and Seller handle/store name (the public
  designer/celebrity label). Native ProductCategory pills are derived from the
  returned items (`All Drops` plus returned names), so no unsupported static
  category or archive filter is invented. A live result count and resettable
  zero-result state update without requesting hidden or sold listings.
- Sold inventory is deliberately absent from `/`; the Sold Closet exists only
  on the relevant public seller profile.
- Backend failure renders an intentional empty-state prompt rather than breaking
  the pitch UI.

### 4.2 Seller profile `/sellers/[handle]`

- Calls `GET /store/sellers/:handle`.
- Displays `seller` profile, public bio/social information, active `products`,
  and historical `archive` items with the Sold Closet treatment. Cards keep the
  HQ-verified signal and add a Sold Closet badge for historical pieces.
- The profile header is an elevated panel and both live/archive grids reuse the
  same ProductCard surface, spacing, typography, and hover behavior as discovery.
- The verification treatment is visual in the MVP. A later revision may make
  it conditional on `seller.verification_status`.
- A missing or inactive seller renders Next.js `notFound()`.

### 4.3 Product `/products/[id]`

- Resolves the public Product from the available discovery catalog, then calls
  `GET /store/products/:id/lineage`.
- Collects unique Product thumbnail/image URLs and renders a sticky desktop
  gallery with client-side thumbnail switching; broken images use the branded
  fallback. On small screens thumbnails become horizontal and the gallery stops
  being sticky.
- Uses a 60/40 desktop split: a sticky thumbnail gallery on the left and an
  elevated sticky Buy Box on the right. The Buy Box contains the verified Seller
  link, currency-formatted first-Variant price, uppercase condition tag,
  security checklist, and electric-lime `Add to collection` action for the
  first/only Variant.
- A below-the-fold Item dossier contains expandable specifications/material
  notes, condition/authentication detail, and the buyer-safe ownership chain.
- Buyers can add one Variant to the local cart. A sold Listing cannot be added.
- Current limitation: a sold Product without an available catalog entry cannot
  open this public product route. Seller Sold Closet cards may link to it, so a
  dedicated public product-detail endpoint is a future backend/UI improvement.

### 4.4 Checkout `/checkout`

- Region state detects an explicit `pawn_region_id` cookie/session selection first, then `cf-ipcountry` (`IN` selects India), and defaults to Europe. The header selector persists the native Medusa EU or India Region ID and reloads Server Components with that explicit cookie.
- Catalog, Seller profile, and Product detail calls include native `region_id`; Medusa derives currency from it. Carts are isolated in `localStorage` by region.
- `formatRegionalPrice` uses `en-EU` EUR or `en-IN` INR grouping and returns `Unavailable` for a missing/zero price.
- Requests a server-priced Stripe PaymentIntent through `POST /store/payment-intent`, confirms its `client_secret` with Stripe Card Elements, then sends its `payment_intent_id` to `POST /store/purchase`.
- Uses Stripe Card Elements for Card Number, Expiry, CVC, and postal code when
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is configured. The Element theme uses the
  dark gallery colors; missing keys show a no-card-data offline preview.
- The browser never sends a price or raw card data to Medusa. The backend resolves
  the native Medusa Region price, creates the PaymentIntent, and verifies its
  `succeeded` status, amount, currency, buyer, Region, and item fingerprint
  before it creates an order or changes marketplace state.
- In local development, missing Stripe keys activate a clearly labelled Demo
  payment mode that simulates success without card collection or Stripe calls.
  Production still requires both Stripe keys.
- On `201`, renders the secure-payment/HQ authentication success journey.
- Clears the temporary cart only after `POST /store/purchase` succeeds.
- The local cart de-duplicates by Variant ID and has no quantity controls. Its
  displayed total is informational; the purchase endpoint remains authoritative.
- Every cart Variant must have a non-zero calculated price in the active region.
  Otherwise the payment surface and submit action are disabled with `Item
  Unavailable in Region`; the UI never sends a zero-value purchase request.
- Server decides currency, price, availability, reservation, inventory, and
  resulting order. Client total is display-only.
- Checkout rows and the payment form use elevated panels; token input focus and
  action controls use the same rounded-xl and lime focus/CTA treatment as Product.

### 4.5 Unified password login `/login`

- One Email/Password form calls `POST /auth/customer/emailpass`; there is no
  buyer/seller role picker.
- It uses authenticated `GET /store/seller/me` to derive access. `200` opens
  `${NEXT_PUBLIC_SELLER_STUDIO_URL}/studio`; `403`/`404` returns the buyer to
  Discovery.
- Buyer and Seller Studio run on separate origins. The bearer token is never
  put in a URL or browser storage; Seller Studio authenticates independently if
  it has no session. Its `/studio` alias redirects to the dashboard.
- `PRO_RESELLER` has no active MVP route or account type. Deactivated reseller
  profiles resolve as buyers until a separate reseller authorization model is
  introduced.

## 5. Marketplace lifecycle shown to buyers

```text
PENDING_APPROVAL (hidden) → AVAILABLE (discoverable) → SOLD (history retained)
                                  │
                                  └─ Admin rejection → REJECTED (hidden)

Buyer purchase → Seller sends to HQ → authenticate/certify → pack → dispatch → deliver
```

The app uses only public, buyer-safe data. Buyer identity, payment details,
internal order line IDs, Admin feedback, and internal HQ state controls do not
appear in public screens.

## Actionable UI inventory

Keep this inventory updated whenever a control is added, removed, renamed, or
its behavior changes. “API” means a network request; “local” means navigation,
React state, or the temporary cart. No public buyer control exposes Admin/HQ
operations or buyer identity data.

### Global header

| Control | Action | Effect |
|---|---|---|
| `pawnpawn` wordmark | Link to `/` | Returns to Discovery (local). |
| `Drops` | Link to `/#drops` | Jumps to the live drop feed (local anchor). |
| `Sell with us` | Link to `/#sell-with-us` | Opens the seller onboarding section on the homepage (local anchor). |
| Theme toggle | Button | Changes presentation-only theme variables and stores the preference under `pawnpawn-theme`; it does not alter marketplace data. |
| Region selector | Select | Stores the selected native EU or India Medusa Region ID as `pawn_region_id`, reloads the server-rendered catalog, and scopes the cart to that region. |
| `Sign in` / `Sign out` | Link / Button | `Sign in` opens `/login` to authenticate the Customer; `Sign out` clears the in-memory Customer session and temporary cart, then returns to Discovery (local). No buyer token is stored in browser storage. |
| `Cart` + count | Link to `/checkout` | Visible only when authenticated. Opens the local one-of-one cart and checkout view. |
| Loading spinner | CSS animation | Golden spinner shown at the top of the homepage while content loads (local). |

### Discovery `/`

| Control | Action | Effect |
|---|---|---|
| Premium trust copy | Read-only | Displays `One of one: never restocked`, `Proceeds can support the seller&#39;s chosen charity`, `Every piece authenticated by HQ`, `Sellers verified in person`, and `Insured, tracked delivery` above the hero CTA (local content). |

| Control | Action | Effect |
|---|---|---|
| Featured seller/drop link | Link to `/products/:id` | Opens the featured Product detail page (local). |
| Category module cards | Buttons | Set the active native ProductCategory filter in the client catalog (local). |
| Search field | Input | Filters already loaded `AVAILABLE` products by title, collection, category, seller handle, or store name (local; no hidden catalog request). |
| Category pills | Buttons with pressed state | Filter the public catalog by returned native category names (local). |
| `Reset discovery filters` | Button | Clears search and category state, restoring the loaded live catalog (local). |
| Product card image/title | Link to `/products/:id` | Opens the Product detail and Buy Box (local). |
| Product card seller handle | Link to `/sellers/:handle` | Opens the public celebrity profile (local). |

### Seller profile `/sellers/:handle`

| Control | Action | Effect |
|---|---|---|
| Active drop card image/title | Link to `/products/:id` | Opens a currently available product (local). |
| Seller handle on a card | Link to `/sellers/:handle` | Reopens the seller profile (local). |
| Sold Closet card | Link to `/products/:id` when available | Opens the public product route if the product is still returned by the available catalog; sold-only product detail is a documented backend limitation. |
| Sold Closet / archive labels | Read-only status | Explain historical ownership without exposing buyer identity or internal HQ controls. |

### Product detail `/products/:id`

| Control | Action | Effect |
|---|---|---|
| Seller name/handle | Link to `/sellers/:handle` | Opens the public Seller profile (local). |
| Gallery thumbnails | Buttons | Switch the active product image; broken images use the branded fallback (local). |
| Product specifics, condition, authentication, ownership chain | Disclosure/accordion controls | Expand buyer-safe details and the public lineage timeline (local). |
| `Add to collection` / `Sign in to add to collection` | Button | Adds the first/only available Variant with a non-zero calculated active-region price at quantity `1`; sold/unavailable items cannot be added. Requires a Customer session — unauthenticated clicks redirect to `/login` and the button is disabled until signed in. |
| `Continue to secure checkout` / `Sign in to checkout` | Link | Shown after adding to cart. `Continue to secure checkout` opens `/checkout` only when authenticated; `Sign in to checkout` opens `/login` when not authenticated (local navigation, checkout requires a Customer session). |

### Checkout `/checkout`

| Control | Action | Effect |
|---|---|---|
| `Discover drops` | Link to `/` | Returns to Discovery when the cart is empty (local). |
| `Remove` | Button | Removes that Variant from the temporary cart (local). |
| Stripe card fields | Hosted Stripe Elements | Collect Card Number, Expiry, and CVC only when Stripe is configured. `confirmCardPayment` confirms the server-created PaymentIntent; Medusa never receives raw card data. |
| Postal code | Input | Supplies postal code only to Stripe during confirmation; it is not persisted by Medusa. |
| `Pay <total> & Secure Drop` | Form submit | Requests a server-priced PaymentIntent, calls Stripe `confirmCardPayment`, then submits `{ items, region_id, payment_intent_id }` to `POST /store/purchase`. It is disabled for a missing/zero total or missing Stripe configuration. On success, clears the cart and shows HQ confirmation. |
| `Explore more drops` | Link after success | Returns to Discovery after the HQ processing confirmation (local). |

### Login `/login`

| Control | Action | Effect |
|---|---|---|
| Email / Password | Inputs | Collect Customer credentials only for Medusa sign-in. |
| `Sign in` | Form submit | Authenticates the Customer, derives Seller access using `/store/seller/me`, then routes Buyer to `/` or Seller to separate Seller Studio `/studio`; no token is placed in a URL or browser storage. |

### Control implementation rule

Do not add a buyer control that implies availability, payment capture,
ownership, delivery timing, certificate status, or Admin/HQ authority unless the
matching public Store API supports it. Add each new control to this inventory
and state whether its effect is API-backed or local in the same documentation
change.

## 6. Backend contracts used

For the complete checkout sequence, see [CHECKOUT_WORKFLOW.md](./CHECKOUT_WORKFLOW.md).

| Route | Purpose | Auth |
|---|---|---|
| `GET /store/products` | `AVAILABLE` catalog, native category/collection/option filters | Publishable key |
| `GET /store/sellers/:handle` | Public seller, active drops, sold archive | Publishable key |
| `GET /store/products/:id/lineage` | Public ownership/provenance history | Publishable key |
| `POST /store/payment-intent` | Server-priced Stripe PaymentIntent | Publishable key + customer Bearer token |
| `POST /store/purchase` | MVP one-of-one checkout | Publishable key + customer Bearer token |
| `POST /auth/customer/emailpass` | Unified password login | Public auth route |
| `GET /store/seller/me` | Derived Seller role after login | Publishable key + customer Bearer token |

See [API.md](./API.md) for payload expectations and errors.
See [BUYER_UI_UX.md](./BUYER_UI_UX.md) for the complete buyer screen and UX
specification.

## 7. Feature status

- [x] Discovery feed with dark premium responsive visual design.
- [x] Modular homepage category cards, HQ guarantee ticker, and live-drop feed.
- [x] Live Medusa catalog request using the configured publishable key.
- [x] Sticky real-time catalog search and native ProductCategory quick filters.
- [x] HQ-verified ProductCard overlays, linked Seller handles, serif price /
  condition-pill hierarchy, Sold Closet context, and 300ms hover interaction.
- [x] Seller profile, verification treatment, active inventory, and Sold Closet.
- [x] Product attributes, Variant price, local one-of-one cart, and lineage UI.
- [x] Amazon-style conversion Product detail: 60/40 sticky gallery/Buy Box,
  verified Seller, one-of-one HQ state, trust checklist, and below-fold dossier.
- [x] Server-priced Stripe PaymentIntent checkout, Stripe confirmation, Demo
  Session Manager, protected purchase finalization, and HQ success screen.
- [x] Unified password login routes Buyers to Discovery and linked Sellers to
  Seller Studio without a role picker or token URL.
- [x] Checkout contract test verifies Intent creation, card confirmation, final
  `payment_intent_id` submission, and post-success cart clearing.
- [x] Tailwind CSS design-system configuration backed by four core CSS theme
  variables, with a persisted header theme-toggle simulation.
- [x] Shared token-backed page container, elevated panel, and primary action
  primitives applied to shell, discovery, seller, product, checkout, and loaders.
- [x] Route loading skeletons and resilient seller/product image fallbacks.
- [x] Error/empty states when backend content is unavailable.
- [x] Lint and production build pass on 2026-10-30 (`npm run build` uses
  validated Next.js webpack mode).
- [ ] Pending — Backend live smoke test: start Medusa, approve a seller Listing,
  and run the complete browse → cart → checkout journey with a seeded buyer.
- [ ] Pending — Production Customer SSO/session management and durable
  inventory reservation/outbox handling. Signed Stripe webhook recovery is
  implemented by the backend.
- [ ] Pending — Native public product-detail endpoint for sold archive links.
- [ ] Planned — Backend-powered catalog facets, order tracking, certificates,
  saved collections, and payment provider UI.

## 8. Demo acceptance flow

1. Start Medusa backend on port `9000` with seeded data and an `AVAILABLE`
   Listing.
2. Start this app on port `3000`.
3. Show discovery card → celebrity profile → product provenance timeline.
4. Add the only Variant to cart.
5. Sign in at `/login` with a demo buyer credential (for example `sarah.johnson@gmail.com` / `buyer1234`). If Stripe is configured, use Stripe test details for browser card validation, then secure the purchase.
6. Confirm success view describes HQ authentication and dispatch.
7. In backend/Admin, confirm Listing is `SOLD`, inventory is zero, and exactly
   one HQ fulfillment and lineage entry exist for that order line.

## 9. Commit convention

Use Conventional Commits: `<type>(buyer): <short imperative description>`.
Types: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`.

Examples:

```text
feat(buyer): add celebrity storefront and provenance timeline
fix(buyer): preserve cart after client hydration
docs(buyer): document checkout demo flow
```

## 10. Test requirement for every change

Every code modification or addition requires relevant test cases. Prefer
focused component, catalog, cart, or API-client tests for changed behavior,
then run:

```bash
npm run lint
npm run build
git diff --check
```

If no test runner exists for a changed surface, record the missing harness and
the exact manual validation steps in the affected documentation before
handoff. Documentation-only changes still require `git diff --check`.
