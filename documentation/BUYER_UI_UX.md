# Buyer Storefront UI and UX Specification

> Implementation brief for design and engineering agents. It describes the
> current buyer application, its intended investor-demo experience, and the
> constraints imposed by the Medusa marketplace backend.

## 1. Product intent

PawnPawn lets fans buy unique items from celebrities and public figures. The
buyer experience must make a purchase feel like acquiring a piece of cultural
history, while giving the buyer clear evidence that the item is authentic and
that fulfilment is handled safely.

### Audience: The Culture Collector & Superfan

The core buyer is a Gen Z to Millennial (21–40) digital native with disposable
income, often an urban professional and fashion/music enthusiast. They seek pop
culture, archival fashion, scarcity, and exclusive status symbols. They value
storytelling, rarity, and transparent provenance over mass consumerism. The UI
must reduce three anxieties: counterfeit luxury goods, uncertain ownership
history, and cluttered/impersonal resale interfaces.

### UX principles

| Principle | Product decision |
|---|---|
| Zero cognitive friction | The primary path is: discover → understand seller/story → inspect provenance → add to cart → secure purchase. |
| Premium restraint | Use generous whitespace, editorial typography, subdued dark surfaces, and one bright action color. Avoid dense ecommerce controls. |
| Trust at every step | State the seller, item condition, PawnPawn HQ process, and provenance without exposing private operational data. |
| One-of-one clarity | Every buyer action assumes a unique item: only one Variant, quantity one, and a visible sold outcome. |
| Honest system state | Show useful empty, unavailable, authentication, and sold states rather than invented data. |

## 2. Global shell

### Header

The persistent sticky header is intentionally small and calm.

| Element | Behavior | Destination |
|---|---|---|
| `pawnpawn` wordmark | Serif wordmark; second word uses lime accent | `/` |
| Drops | Scroll navigation | `/#drops` |
| How it works | Scroll navigation | `/#how-it-works` |
| Cart + count | Shows number of distinct cart Variants | `/checkout` |

The header has a translucent dark background with blur and a bottom hairline.
On narrow screens, only the cart remains visible beside the wordmark; in-page
links are hidden to preserve space.

### Footer

The footer is intentionally minimal: a single brand/provenance statement. It
does not attempt to replicate customer service, policy, or social navigation for
the investor MVP.

### Visual language

| Token | Current treatment | Tailwind-compatible utility | Meaning |
|---|---|---|---|
| Page background | Near-black warm brown `#12100f` | `bg-[#12100f]` | Gallery-like, premium base |
| Panel surface | Warm charcoal `#1a1715` | `bg-[#1a1715]` | Separation without card clutter |
| Primary text | Off-white `#f5f1ec` | `text-[#f5f1ec]` | High contrast reading |
| Muted text | Warm gray `#a49d96` | `text-[#a49d96]` | Supporting detail |
| Primary action | Lime `#d8ff59` | `bg-[#d8ff59]`, `text-[#d8ff59]` | Add, purchase, verification emphasis |
| Editorial accent | Coral `#ff7c8d` | `text-[#ff7c8d]` | Hero story emphasis only |
| Display type | Georgia-style serif | Emotional/editorial titles |
| UI type | System sans-serif | Functional labels and controls |

Use the serif font for page titles, product names, large prices, and emotionally
important statements. Use the sans-serif font for navigation, labels, metadata,
and forms. Do not introduce additional colors for Listing lifecycle states in the
buyer UI; Admin owns moderation status presentation.

### Theme implementation contract

All UI colors must resolve from the four core variables in `app/globals.css`:
`--theme-bg-base`, `--theme-text-primary`, `--theme-accent`, and
`--theme-editorial`. `--theme-surface`, `--theme-text-muted`, and
`--theme-border` are derived from those values using `color-mix`; they are not
independent brand tokens. `tailwind.config.ts` exposes the values as
`bg-theme-base`, `bg-theme-surface`, `text-theme-primary`, `text-theme-muted`,
`bg-theme-accent`, and `border-theme-border`.

The header’s theme control is a presentation-only light/dark simulation. It
switches the same four variables via an HTML `data-theme` attribute and persists
the preference in `localStorage`; it must not alter catalog or cart data.

### Spacing, texture, and separation

- Prefer thin `border-white/10` hairlines for spatial separation instead of
  heavy card outlines or high-contrast dividers.
- Use restrained radial warm/lime ambient light fields only in hero/feature
  zones; the rest of the page remains quiet so product photography leads.
- Preserve a generous gallery rhythm equivalent to Tailwind `py-24` and
  `space-y-12`. Do not compress core screen sections into dense marketplace
  layouts.
- Use the shared `.page-container` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`)
  for every screen and persistent shell container. Use `.elevated-panel` for
  cards/panels and `.primary-action` for electric-lime CTAs; these preserve
  surface, border, rounded-xl, and keyboard-focus consistency.

## 3. Screen: Discovery feed (`/`)

### Purpose

Create an emotional first impression, establish the HQ authenticity model, and
let a buyer enter a drop with one click.

### Information hierarchy

```text
Sticky header
└─ Hero
   ├─ Eyebrow: “A considered collection of stories”
   ├─ Headline: “Wear the moment. Keep the story.”
   ├─ 1-sentence HQ value proposition
   ├─ Primary CTA: Explore the drops
   └─ Featured seller link (first available item)

Available now
├─ Modular category/drop cards (up to four, from public native categories)
├─ HQ guarantees ticker
└─ “Stories in circulation” + authenticated item count
   ├─ Sticky search input + category quick-filter pills
   └─ 3-column responsive product card grid

How it works
└─ Celebrity drop → HQ authentication → Yours to continue
```

### Hero

- The hero is intentionally text-first, with soft radial warm/lime color fields
  and an oversized low-contrast `PAWNPAWN` background wordmark.
- The primary rounded-xl lime CTA scrolls to the live catalog, avoiding a false
  separate landing flow.
- If the catalog has at least one item, the hero shows a quiet featured seller
  link to the first product. This link is secondary to the primary catalog CTA.
- The content must never imply that PawnPawn ships directly from the seller;
  wording always says the item travels through HQ.

### Modular category cards and HQ ticker

Below the hero, the app derives up to four image-led modules from the public
catalog: `Celebrity closets` plus available native ProductCategory names.
Selecting one applies that category to the live feed without a route transition
or second API request. This deliberately avoids a static `Archives` control:
sold items belong only in the Seller Sold Closet contract.

The horizontal guarantee bar states three buyer promises: authenticated at
PawnPawn HQ, insured global dispatch, and immutable ownership chain. It is a
trust cue, not an operational status tracker.

### Product-card anatomy

```text
Image (4:5-ish visual area)
├─ Upper-left: “HQ Verified” badge
├─ Upper-right: “Sold closet” when rendered from seller history
└─ Hover: image scales to 105%; card receives a restrained lime border,
   both over 300ms with a cubic-bezier transition

Product title in serif
Seller handle in lime: @handle, linked to seller profile
Bold serif price + right-aligned uppercase condition pill
```

The entire image and product title link to `/products/[id]`. The seller line
links to `/sellers/[handle]`. Cards should never show admin review states,
inventory quantities, raw IDs, or SKU values.

### Search and category quick bar

The catalog controls sit directly below the hero and remain sticky below the
global header while a buyer scans the grid. The input searches the already
loaded public catalog in real time by Product title/handle, drop Collection
title, and Seller handle or store name (the public designer/celebrity label).
Category pills are generated from Medusa `ProductCategory` names in the
response, beginning with `All Drops`; they are horizontally scrollable on
narrow screens. A live result count confirms the current filter result.

Filtering is an in-browser discovery refinement only. `GET /store/products`
remains the authority that excludes non-`AVAILABLE` Listings. If no pieces
match the search/category combination, show a composed fallback and expose
`Reset discovery filters` to clear both controls.

### Empty and degraded state

If `GET /store/products` fails or returns no available Products, show:

> “The next drop is being prepared at PawnPawn HQ.”

Then show a smaller local-development hint to start Medusa on port 9000. This
keeps the investor UI composed while still making an unavailable local backend
understandable.

### Data dependency

`GET /store/products?limit=48` with `x-publishable-api-key`. The backend already
filters to published Products with `Listing = AVAILABLE`. The UI must not bypass
that filter or query Admin routes.

## 4. Screen: Celebrity profile (`/sellers/[handle]`)

### Purpose

Turn a product seller into a credible, human collection owner. Let buyers browse
a celebrity’s active items and see the historical evidence of past drops.

### Layout

```text
Seller hero
├─ Circular avatar / initial fallback
└─ Verified seller badge
   Store name
   @handle
   Bio
   Public social handles (if supplied)

The seller hero uses the same elevated panel, border, rounded-xl, and
typography system as homepage cards and the Product Buy Box.

Available drops
└─ Standard product grid

Sold Closet
└─ Divider + same grid, cards labelled “Sold archive”
```

### Seller hero details

- Avatar falls back to the first character of the store name.
- The `Verified seller` treatment is presentational in the current MVP. A future
  revision should render it conditionally from `verification_status` instead of
  assuming every publicly returned seller is verified.
- Render only the public `bio`, `avatar_url`, handle, store name, and social
  handles returned by the backend. Do not add private customer information.

### Active vs Sold Closet behavior

| Section | Source | Card behavior |
|---|---|---|
| Available drops | `products` | “HQ verified” badge; may open Product and enter cart |
| Sold Closet | `archive` | “HQ verified” and “Sold closet” badges; historical display only |

The Sold Closet demonstrates social proof and a seller’s item history. It is not
a repurchase catalogue. The current public Product detail route resolves only
available Products; therefore agents should avoid promising that every archive
card has a fully viewable detail page until the backend adds a public detail
endpoint for SOLD Listings.

### Failure state

If the seller does not exist or the backend rejects the request, use Next.js
`notFound()`. Do not replace an unknown seller with a generic profile.

### Data dependency

`GET /store/sellers/:handle` returns `{ seller, products, archive }`.

## 5. Screen: Product detail and ownership chain (`/products/[id]`)

### Purpose

Give a buyer enough certainty to commit: who owned/sold it, what it is, why it
is unique, what it costs, and how authenticity is preserved.

### Layout

```text
Desktop, 60/40 split
├─ Left: sticky gallery
│  ├─ Vertical thumbnail switcher
│  └─ High-resolution 4:5 primary image / fallback visual
└─ Right: matte Buy Box
   ├─ Verified Celebrity Seller badge + store link
   ├─ Title, exact price, condition, and one-unit availability
   ├─ HQ assurance checklist
   └─ Full-width collection action

Below the split: Item dossier
└─ Expandable specifications/material notes, condition, and ownership-chain sections
```

On mobile, thumbnails become a horizontal strip and the Buy Box follows the
gallery. The gallery stops being sticky so the entire conversion panel remains
easy to reach.

### Buy Box

| Element | UX behavior |
|---|---|
| Container | Distinct matte `bg-theme-surface`, `border-theme-border`, `rounded-xl`, `shadow-2xl`, padded card that stays sticky beneath the header on desktop |
| Seller trust | `Verified Celebrity Seller` badge plus lime store link; opens seller profile |
| Title | Large serif hierarchy inside the Buy Box |
| Price | Uses the first Variant’s Medusa price; formatted according to currency |
| Condition | Bordered condition pill from Listing/item metadata |
| Stock | `Verified 1-of-1 Item in PawnPawn HQ` when the first Variant is purchasable; otherwise sold state |
| Value checklist | Authenticated & Certified by PawnPawn HQ, Insured Global Dispatch, Immutable Ownership Chain (Lineage Verified) |
| Add to collection | Full-width electric-lime `rounded-xl` action; adds the first/only Variant to cart |
| Added state | Primary label confirms the add and exposes full-width secure checkout action |

The backend’s unique-item policy permits one variant value per option. The UI
therefore treats the first Variant as the purchasable item. If multi-variant
catalog behavior is introduced later, replace this assumption with an explicit
Variant selection control before enabling Add to cart.

### Gallery behavior

The gallery is a focused conversion aid rather than a social carousel. It uses
all unique URLs from thumbnail, Product images, and permitted display-image
metadata. Selecting a thumbnail updates only the client-side active image; it
does not mutate Product or Listing data. Broken images fall back to the branded
surface. On desktop, the gallery is sticky beneath the global header while the
buyer reads the Buy Box.

### Information density disclosures

Native `<details>` disclosures sit in a separate below-the-fold Item dossier.
This preserves Buy Box focus while avoiding a long, low-conversion detail page:

| Disclosure | Open state | Content |
|---|---|---|
| Specifications & material notes | Open by default | Description plus ProductOption rows, including material when supplied |
| Condition & authentication | Closed | Condition value and the HQ review/certificate explanation |
| Ownership chain | Closed | Buyer-safe vertical lineage timeline |

The ownership timeline remains a trust feature, never a transaction ledger.
It shows public seller/store identity, date, and price only when returned. It
never renders `buyer_id` as a person.

### Sold/unavailable behavior

- If the Listing is `SOLD`, replace purchase controls with “This piece is in the
  sold closet.”
- If no Variant is present, show “This drop is currently unavailable.”
- If the Product cannot be found in the public available catalog, render 404.

When no lineage exists, the disclosure explains that the item begins its public
authentication record with this drop.

### Data dependencies

1. `GET /store/products` is currently used to resolve the public Product by ID.
2. `GET /store/products/:id/lineage` supplies the timeline.

The present implementation intentionally never trusts product `metadata` for
seller ownership; it reads the response’s `seller` and `marketplace_listing`
projection supplied by the backend.

## 6. Screen: Cart and checkout (`/checkout`)

### Purpose

Make a unique-item purchase feel simple while clearly setting expectations for
the HQ intermediary flow.

### Cart state

- Cart is a small client-side context stored under `pawnpawn-buyer-cart` in
  `localStorage` after hydration.
- The cart de-duplicates by `variant.id`; quantity controls do not exist.
- Each cart row presents seller/store name, product title, display price, and a
  remove action inside the shared elevated-panel treatment.
- Local cart state is convenience data only. It is never an inventory claim.
  Backend stock/Listing checks at checkout decide whether purchase succeeds.

### Empty cart

Show “Your cart is waiting for a story.” and one prominent `Discover drops` CTA.
Do not show an empty payment form or totals.

### Checkout summary

```text
Secure handover
Display total
HQ promise: held → received → authenticated/certified → dispatched
Stripe card surface or offline-safe payment preview
Demo Session Manager with advanced manual token entry
Pay total & Secure Drop CTA
```

The checkout form is an elevated panel. With a Stripe publishable key it renders
hosted Card Number, Expiry, and CVC Elements plus a postal-code input, all using
the dark gallery palette. Without a key, it renders a safe payment preview and
does not collect card data. The purchase button uses the same rounded-xl primary
action as discovery and Product detail.

The display total is derived from Variant prices in the local cart. It is not
authoritative. Do not add delivery fees, taxes, discounts, or a currency switch
without backend support.

### Authentication and token UX

The current MVP uses a Demo Session Manager that calls development-only
`POST /api/demo-session`; its server side obtains a local Customer JWT through
Medusa emailpass, with manual token entry under an Advanced disclosure. This is
a demo bridge, not the production authentication design.

- A missing token blocks submission with an instructional inline error.
- The token remains only in React state; do not put it in localStorage, URL,
  logs, analytics, or error telemetry.
- Stripe browser validation creates a PaymentMethod when configured. It must not
  be described as a charge until a backend PaymentIntent and webhook flow exist.
- A future app should replace this field with buyer sign-in/session management.

### Submission states

| State | UI response |
|---|---|
| Idle | `Pay <total> & Secure Drop` enabled |
| Loading | Button reads `Securing your drop…` and is disabled |
| Backend error | Inline backend message, for example 401/409; cart is retained |
| Success | Full success view replaces checkout form |

### Success view

The success view avoids pretending an item has already shipped. It says payment
is secured and shows the real sequence:

1. Seller sends to HQ
2. Authenticate and certify
3. Dispatch to buyer

It ends with `Explore more drops`, returning to discovery. The app does not yet
have an order-history or tracking route.

### Data dependency

`POST /store/purchase` with a publishable key, customer Bearer token, and one
`{ variant_id, quantity: 1 }` record per cart item. Successful checkout changes
the backend Listing to `SOLD`, inventory to zero, and creates HQ/lineage data.

## 7. UX states and error handling

| Situation | Required buyer behavior |
|---|---|
| Catalog backend unavailable | Show composed empty state; do not crash page |
| Seller unavailable | 404 |
| Product unavailable | 404 |
| No image | Branded PawnPawn fallback block |
| No bio | “A curated PawnPawn collection.” fallback |
| No description | Safe one-line provenance fallback |
| No lineage | Explain first public authentication chapter |
| No Variant | Explain it is unavailable; remove commerce action |
| Listing sold after a buyer adds it | Backend returns 409; preserve cart and explain the message |
| Purchase unauthenticated | Ask for local demo token; do not silently redirect |

## 8. Responsive and accessibility requirements

- Desktop discovery and archive grids use three columns; mobile uses one column.
- Product detail uses two columns on desktop and stacks on small screens.
- Navigation collapses to brand plus Cart on narrow screens.
- Maintain text contrast against warm dark surfaces; lime is an accent, not body
  text on a light background.
- Product images must have product title alt text. Decorative seller avatars use
  empty alt text only when adjacent visible seller text already identifies them.
- Buttons use real `<button>` elements. Navigation uses links.
- Keyboard focus styles and accessible labels must be preserved when changing
  the visual system.
- Do not depend on hover alone for critical information or actions.

## 9. Components and change guidance

| Component/file | Responsibility | Do not change without |
|---|---|---|
| `lib/medusa.ts` | API request shape, cache behavior, image and price helpers | Checking [API.md](./API.md) and backend contract |
| `components/cart-provider.tsx` | Temporary cart persistence/hydration | Preserving no-token/no-price/no-stock boundary |
| `components/checkout-client.tsx` | Authenticated purchase UI | Preserving token privacy and backend error behavior |
| `components/discovery-catalog.tsx` | Category modules, trust ticker, instant search and feed | Preserving public `AVAILABLE` boundary |
| `components/product-card.tsx` | Shared live/archive visual card | Retaining distinct archive treatment |
| `components/lineage-timeline.tsx` | Buyer-safe provenance display | Preserving buyer privacy |
| `app/globals.css` | Shared visual and responsive system | Checking all four screens at desktop and mobile sizes |

## 10. Deliberate MVP exclusions

- Buyer sign-up/sign-in and durable session UI
- Backend-powered collection and option facets beyond the current client-side
  title/designer/category discovery controls
- Variant choice UI for multi-variant products
- Real payments, taxes, shipping address collection, shipping estimates
- Orders page, tracking page, certificate download, notifications
- Wishlist, social feed, chat, reviews, or resale listing creation

Build these only after their backend contracts and user flows are defined. Do not
invent customer-visible states that the backend cannot support.
