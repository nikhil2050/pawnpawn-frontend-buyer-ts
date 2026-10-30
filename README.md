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
For local demonstration, sign in through Medusa's customer auth endpoint and paste
the resulting token into the checkout field. The public discovery, profile, and
product pages use the configured publishable API key.

## API contracts

- `GET /store/products` — available catalog, native Medusa taxonomy filters.
- `GET /store/sellers/:handle` — verified public seller, active items, sold archive.
- `GET /store/products/:id/lineage` — public ownership history.
- `POST /store/purchase` — protected one-of-one MVP checkout.

See [`documentation/README.md`](./documentation/README.md) for architecture,
API contracts, local demo instructions, and contributor guidance.
