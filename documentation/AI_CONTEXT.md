# PawnPawn Buyer App Context

> Token-optimized context for contributors and agents. Updated: 2026-10-30.

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
| Discovery UI, seller/product views, provenance presentation, local cart, checkout request UI | Medusa Products/Variants/prices, Seller/Listing mapping, availability, stock, orders, payment placeholder, HQ fulfillment, lineage |

**Source of truth:** custom backend `listing` records map `listing.product_id`
to `listing.seller_id`. Do not infer seller ownership or listing lifecycle from
Product metadata.

## 2. Runtime and environment

| Item | Value |
|---|---|
| Framework | Next.js 16.4.3, React 19, TypeScript, App Router |
| Buyer URL | `http://localhost:3000` |
| Backend URL | `http://localhost:9000` (configurable) |
| Environment | `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` |
| Public key default | `pk_a6c505481cec4bc82dd9cfcbee017cac5ca0affd31ae65ee78861dcd46bc30e4` |
| Validation | `npm run lint`, `npm run build` |

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

## 3. Code map

```text
app/
  page.tsx                    Discovery feed (/)
  sellers/[handle]/page.tsx   Public seller profile and sold archive
  products/[id]/page.tsx      Product detail and ownership chain
  checkout/page.tsx           Cart checkout shell
  globals.css                 Premium responsive design system
  loading.tsx                 Discovery loading skeleton
  products/[id]/loading.tsx   Product loading skeleton
  sellers/[handle]/loading.tsx Seller loading skeleton
components/
  cart-provider.tsx           Browser-only temporary cart
  checkout-client.tsx         Protected checkout interaction
  listing-image.tsx           External image failure fallback
  product-gallery.tsx         Client-side thumbnail gallery selection
  product-accordions.tsx      Accessible Buy Box disclosures and lineage
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
- Cards show image, title, price, seller, condition, and authenticity badge.
- Backend failure renders an intentional empty-state prompt rather than breaking
  the pitch UI.

### 4.2 Seller profile `/sellers/[handle]`

- Calls `GET /store/sellers/:handle`.
- Displays `seller` profile, public bio/social information, active `products`,
  and historical `archive` items with the Sold Closet treatment.
- A missing or inactive seller renders Next.js `notFound()`.

### 4.3 Product `/products/[id]`

- Resolves the public Product from the available discovery catalog, then calls
  `GET /store/products/:id/lineage`.
- Shows the first Variant’s price, ProductOption values, seller, condition,
  availability, HQ assurances, and public lineage timeline in a high-density
  matte Buy Box. Its desktop gallery is sticky and supports thumbnail switching.
- Product specifics, condition/authentication notes, and the ownership chain
  render as expandable native disclosures in the Buy Box.
- Buyers can add one Variant to the local cart. A sold Listing cannot be added.
- Current limitation: a sold Product without an available catalog entry cannot
  open this public product route. Seller Sold Closet cards may link to it, so a
  dedicated public product-detail endpoint is a future backend/UI improvement.

### 4.4 Checkout `/checkout`

- Reads local cart entries from `localStorage` after hydration.
- Sends only `{ variant_id, quantity: 1 }` per item to `POST /store/purchase`.
- Requires a customer JWT entered for the local demo; it is held only React
  state, never persisted.
- On `201`, renders the secure-payment/HQ authentication success journey.
- Server decides currency, price, availability, reservation, inventory, and
  resulting order. Client total is display-only.

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

## 6. Backend contracts used

| Route | Purpose | Auth |
|---|---|---|
| `GET /store/products` | `AVAILABLE` catalog, native category/collection/option filters | Publishable key |
| `GET /store/sellers/:handle` | Public seller, active drops, sold archive | Publishable key |
| `GET /store/products/:id/lineage` | Public ownership/provenance history | Publishable key |
| `POST /store/purchase` | MVP one-of-one checkout | Publishable key + customer Bearer token |

See [API.md](./API.md) for payload expectations and errors.
See [BUYER_UI_UX.md](./BUYER_UI_UX.md) for the complete buyer screen and UX
specification.

## 7. Feature status

- [x] Discovery feed with dark premium responsive visual design.
- [x] Live Medusa catalog request using the configured publishable key.
- [x] Seller profile, verification treatment, active inventory, and Sold Closet.
- [x] Product attributes, Variant price, local one-of-one cart, and lineage UI.
- [x] Amazon-style conversion Product detail: sticky thumbnail gallery, verified
  seller Buy Box, one-unit HQ stock state, trust checklist, and disclosures.
- [x] Protected dummy checkout request and HQ success screen.
- [x] Tailwind CSS design-system configuration backed by four core CSS theme
  variables, with a persisted header theme-toggle simulation.
- [x] Route loading skeletons and resilient seller/product image fallbacks.
- [x] Error/empty states when backend content is unavailable.
- [x] Lint and production build pass on 2026-10-30 (`npm run build` uses
  validated Next.js webpack mode).
- [ ] Pending — Backend live smoke test: start Medusa, approve a seller Listing,
  and run the complete browse → cart → checkout journey with a seeded buyer.
- [ ] Pending — Buyer authentication UI/session management; MVP currently accepts
  an explicitly pasted local customer token for checkout.
- [ ] Pending — Native public product-detail endpoint for sold archive links.
- [ ] Planned — Catalog filter controls, search, order tracking, certificates,
  saved collections, and payment provider UI.

## 8. Demo acceptance flow

1. Start Medusa backend on port `9000` with seeded data and an `AVAILABLE`
   Listing.
2. Start this app on port `3000`.
3. Show discovery card → celebrity profile → product provenance timeline.
4. Add the only Variant to cart.
5. Authenticate a seeded buyer through Medusa, paste the token at checkout, and
   secure the purchase.
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
