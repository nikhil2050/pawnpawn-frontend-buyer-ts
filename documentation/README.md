# PawnPawn Buyer Documentation

The buyer storefront is a Next.js 16 App Router investor-demo application. It
shows only marketplace inventory approved by PawnPawn and delegates commerce,
ownership, and fulfillment state to the Medusa backend.

| Document | Purpose |
|---|---|
| [AI_CONTEXT.md](./AI_CONTEXT.md) | Architecture, source of truth, current feature status, and agent context |
| [API.md](./API.md) | Backend contracts consumed by the buyer UI |
| [LOCAL_DEPLOYMENT.md](./LOCAL_DEPLOYMENT.md) | Local setup, demo flow, and verification checklist |
| [BUYER_UI_UX.md](./BUYER_UI_UX.md) | Complete screen-by-screen UI/UX implementation brief |
| [../AGENTS.md](../AGENTS.md) | Instructions for contributors and coding agents |
| [CLAUDE.md](./CLAUDE.md) | Redirect for Claude-based coding agents |

The current UI uses Tailwind CSS 3 utilities with a CSS-variable-backed theme,
Next.js 16 webpack production builds, route loading skeletons, and resilient
external image fallbacks. The backend remains the source of truth for all
catalog and marketplace state.

## Quick start

```bash
cd Projects/pawnpawn-frontend-buyer-ts
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Start the backend separately on
`http://localhost:9000` to populate the discovery feed.

## Ownership boundaries

The buyer app owns presentation, local cart state, and initiating checkout. The
backend owns Product, Variant, price, Listing status, inventory, order,
fulfillment, and lineage records. Do not derive ownership from Product metadata:
the backend Listing relation is the marketplace source of truth.
