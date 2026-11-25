# PawnPawn Buyer Storefront

Investor-demo buyer experience for the PawnPawn marketplace. It uses Medusa store
APIs for the available catalog, public seller profiles, product provenance, and
the protected MVP checkout.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The Medusa backend must run at `http://localhost:9000`.

The checkout uses `POST /store/purchase`, which requires a customer session token.
For a local investor demo, sign in at `/login` with a demo buyer credential
(for example `sarah.johnson@gmail.com` / `buyer1234`). The token is held only in
the current tab's React state. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to enable
Stripe Elements card validation. The current backend has no PaymentIntent endpoint,
so this does not capture a live payment. The public discovery, profile, and product
pages use the configured publishable API key.

## API contracts

- `GET /store/products` — available catalog, native Medusa taxonomy filters.
- `GET /store/sellers/:handle` — verified public seller, active items, sold archive.
- `GET /store/products/:id/lineage` — public ownership history.
- `POST /store/purchase` — protected one-of-one MVP checkout.

See [`documentation/README.md`](./documentation/README.md) for architecture,
API contracts, local demo instructions, and contributor guidance.
