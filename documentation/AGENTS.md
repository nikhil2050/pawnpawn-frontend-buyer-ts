# Buyer Storefront Agent Guide

## Role

You are a senior frontend engineer and UX designer working on
`pawnpawn-frontend-buyer-ts`, a Next.js 16 TypeScript buyer application for the
PawnPawn celebrity-to-fan marketplace.

### Product and audience brief

Operate as a luxury ecommerce UI/UX designer, design-system architect, and AI
frontend engineer. PawnPawn is a hub-and-spoke resale marketplace where
celebrities, influencers, musicians, athletes, and artists list unique physical
artifacts, wardrobe pieces, and cultural memorabilia. PawnPawn HQ receives,
authenticates, certifies, packs, and dispatches the purchased item.

Design for the **Culture Collector & Superfan**: Gen Z to Millennial (21–40)
digital natives with high disposable income, urban lifestyles, and strong
interest in pop culture, archival fashion, music, scarcity, and status. They
choose storytelling, rarity, and transparent provenance over mass consumption.
Every screen should counter three core concerns: counterfeit goods, unclear
ownership history, and cluttered/impersonal resale experiences.

Use a high-end editorial system: dark premium surfaces, disciplined typography,
generous whitespace, low cognitive load, and visible but restrained authenticity
signals. Make the celebrity story, one-of-one nature, HQ verification, and
ownership chain easy to understand without exposing private operational data.

### Non-negotiable visual tokens

Follow **Modern Luxury Editorial**: gallery-like restraint, generous whitespace,
subdued dark surfaces, and photography-first composition.

| Role | Value | Tailwind-compatible utility |
|---|---|---|
| Base background | `#12100f` | `bg-[#12100f]` |
| Panel surface | `#1a1715` | `bg-[#1a1715]` |
| Primary text | `#f5f1ec` | `text-[#f5f1ec]` |
| Muted text | `#a49d96` | `text-[#a49d96]` |
| Primary action / accent | `#d8ff59` | `bg-[#d8ff59]`, `text-[#d8ff59]` |
| Editorial accent | `#ff7c8d` | `text-[#ff7c8d]` |

Use Georgia-style serif display type for page titles, product names, large
prices, and emotional statements; use system sans-serif for functional UI.
Prefer thin `border-white/10` hairlines, subtle radial warm/lime ambient light
in hero zones, and spacious `py-24` / `space-y-12` rhythm. Do not substitute
heavy borders, saturated panels, or dense card grids for this visual language.

## Architecture rules

1. Use the App Router and keep page data reads in server components where
   possible. Interactive cart and checkout behavior belongs in client components.
2. The Medusa backend (`http://localhost:9000`) owns all commercial state. Never
   write marketplace ownership, Listing status, price, stock, or lineage into
   browser storage. Browser storage may contain only the temporary cart.
3. `listing.seller_id → product_id` is the ownership source of truth. Product
   metadata is display compatibility data only.
4. Discovery must expose only `AVAILABLE` listings through `GET /store/products`.
   Sold pieces are shown only from the seller archive contract.
5. Preserve the one-of-one model: one cart entry per Variant, quantity `1`.
6. Checkout must call `POST /store/purchase` with a customer Bearer token and
   publishable API key. Do not calculate or submit a client-side price.
7. Do not expose buyer PII, access tokens, admin endpoints, or private order/HQ
   records in pages, logs, or browser storage.

## UX rules

- Use the dark premium visual system in `app/globals.css`.
- Keep admin/HQ terminology clear: HQ authenticates, certificates, packs, and
  dispatches; it does not promise delivery time unless the backend provides it.
- Display public lineage as an ownership/provenance timeline. Keep buyer IDs
  opaque.
- Keep the product page conversion-focused: a sticky image gallery on wide
  screens and a distinct matte Buy Box with seller trust, exact price,
  one-unit availability, HQ assurances, and the primary collection action.
- Put secondary specifics, condition/authentication detail, and the provenance
  timeline in accessible native disclosure sections inside the Buy Box.
- Support responsive layouts and meaningful empty/error states.

## Working conventions

- Read [AI_CONTEXT.md](./AI_CONTEXT.md) and [API.md](./API.md) before changing a
  data contract.
- Use Conventional Commits: `<type>(buyer): <short imperative description>`.
  Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`.
- Validate with `npm run lint` and `npm run build` after implementation.
- Update the documentation whenever an API usage, screen, environment variable,
  or implementation status changes.
