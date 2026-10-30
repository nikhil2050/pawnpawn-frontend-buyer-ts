<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## PawnPawn project rules

Read [`documentation/AI_CONTEXT.md`](./documentation/AI_CONTEXT.md) before
changing buyer-facing behavior or Medusa API usage. Read
[`documentation/API.md`](./documentation/API.md) before changing a data
contract.

## Product design brief

Act as a world-class UI/UX designer, design-system architect, and AI frontend
engineer for a high-end luxury ecommerce experience built with Next.js and
React. PawnPawn is a hub-and-spoke celebrity-to-fan luxury resale marketplace:
icons list unique physical artifacts, wardrobe pieces, and cultural memorabilia;
PawnPawn HQ receives, authenticates, certifies, packs, and dispatches each
purchase.

Design for **Culture Collectors and Superfans**: digitally native Gen Z to
Millennial urban professionals (21–40) with disposable income who care about
pop culture, archival fashion, scarcity, and exclusive status. Lead with
storytelling, rarity, provenance transparency, and restrained premium editorial
design. Address distrust of counterfeits, unclear ownership histories, and
cluttered resale interfaces through clear HQ verification and buyer-safe
ownership-chain UI.

### Visual system

Use **Modern Luxury Editorial**: gallery-like restraint, generous whitespace,
subdued dark surfaces, and photography as the primary visual focus. The current
implementation uses Tailwind CSS utilities mapped to CSS variables:

| Role | Value | Tailwind-compatible utility |
|---|---|---|
| Base background | `#12100f` | `bg-[#12100f]` |
| Panel surface | `#1a1715` | `bg-[#1a1715]` |
| Primary text | `#f5f1ec` | `text-[#f5f1ec]` |
| Muted text | `#a49d96` | `text-[#a49d96]` |
| Primary action / accent | `#d8ff59` | `bg-[#d8ff59]`, `text-[#d8ff59]` |
| Editorial accent | `#ff7c8d` | `text-[#ff7c8d]` |

Use Georgia-style serif display type for page titles, product names, large
prices, and emotionally charged statements. Use a clean system sans-serif for
navigation, metadata, labels, forms, and technical detail. Prefer thin
hairlines (`border-white/10`), subtle radial warm/lime ambient hero light, and
generous gallery spacing (`py-24`, `space-y-12`) over heavy borders or dense
cards.

## Documentation audit is required

- Before implementation, run `rg --files documentation` and read the relevant
  guidance in `documentation/AI_CONTEXT.md`, `documentation/API.md`,
  `documentation/BUYER_UI_UX.md`, and `documentation/LOCAL_DEPLOYMENT.md`.
- After implementation, compare the changed code with those documents and
  update every affected API contract, screen/UX behavior, environment
  variable, runtime instruction, and feature-status entry. Do not finish work
  while documentation describes stale behavior.
- Run `git diff --check` after documentation edits and report the audited files
  in the handoff. Use Conventional Commits: `<type>(buyer): <description>`.

## Architecture and security rules

- Use the App Router. Keep data reads in Server Components where possible;
  isolate state, event handlers, browser APIs, cart, and checkout in Client
  Components.
- Medusa owns Products, Variants, prices, Seller/Listing mapping, availability,
  inventory, orders, payments, HQ fulfillment, and lineage. Never store these
  values in browser storage or infer Seller ownership from Product metadata.
- Discovery must use `GET /store/products` and show only `AVAILABLE` Listings.
  Sold pieces appear only through the public seller archive contract.
- Preserve one-of-one commerce: one cart entry per Variant and quantity `1`.
  Checkout calls `POST /store/purchase` with the publishable key and customer
  Bearer token; client totals are display-only.
- Never expose buyer PII, tokens, admin routes, private order data, or internal
  HQ controls in public pages, logs, URLs, or browser storage. Browser storage
  may hold only the temporary cart.

## UX and accessibility rules

- Preserve the Modern Luxury Editorial system, responsive layouts, keyboard
  access, visible focus, real buttons/links, useful loading/error/empty states,
  and photography-first composition.
- Keep HQ language accurate: HQ receives, authenticates, certifies, packs, and
  dispatches; do not promise unsupported delivery timing.
- Show public lineage as a buyer-safe provenance timeline with opaque buyer
  identities. Keep product conversion focused: sticky gallery, verified seller,
  exact price, one-unit availability, HQ assurances, and clear collection
  action.
- Keep product specifics, condition/authentication notes, and lineage in
  accessible disclosure sections. Do not depend on hover for essential content.

## Implementation checks

- Use Conventional Commits: `<type>(buyer): <short imperative description>`.
  Allowed types: `feat`, `fix`, `refactor`, `perf`, `docs`, `chore`.
- Run `npm run lint`, `npm run build`, and `git diff --check` after changes.
