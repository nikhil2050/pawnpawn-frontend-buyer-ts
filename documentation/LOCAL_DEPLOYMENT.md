# Local Deployment and Demo Guide

## 1. Prerequisites

- Node.js compatible with Next.js 16 (use Node 20.19+, Node 22.13+, or Node 24+)
- Running PawnPawn Medusa backend at `http://localhost:9000`
- Backend seed/import completed with published Products and `AVAILABLE` Listings
- A browser and a local buyer customer credential

## 2. Configure and start

```bash
cd Projects/pawnpawn-frontend-buyer-ts
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

| Variable | Local value | Purpose |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `http://localhost:9000` | Store API origin |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | provided demo key | Public Medusa API key |
| `NEXT_PUBLIC_SELLER_STUDIO_URL` | `http://localhost:3001` | Seller role-routing destination |

## 3. Start the backend

Follow the backend repository’s `documentation/LOCAL_DEPLOYMENT.md`. At a
minimum, PostgreSQL must be ready, seed data imported, and the backend process
must listen on port 9000:

```bash
cd Projects/pawnpawn-backend-ts/apps/backend
../../node_modules/.bin/medusa develop
curl http://localhost:9000/health
```

If the feed says the next drop is being prepared, first check the backend health
endpoint, then ensure an Admin has approved a Listing to `AVAILABLE` and its
Product is published.

## 4. Investor demo flow

1. Visit `/`, show the modular category cards and HQ guarantee ticker, then use
   sticky search or a category pill to refine the authenticated discovery feed.
2. Use the header region selector to show **Europe · EUR** (default) or
   **India · INR**. The page stores the native Medusa Region ID and reloads so
   the backend returns only items with a positive calculated price for that
   region; carts do not cross regions.
3. Open a card to show the Product’s condition, single Variant, localized price, and HQ
   authentication promise.
4. Open the seller name to demonstrate celebrity store identity, active drops,
   and Sold Closet archive.
5. Return to the product and discuss the Ownership Chain timeline.
6. Add the product to Cart, then open `/checkout`.
7. Open `/login` and sign in with `sarah.johnson@gmail.com` / `buyer1234`.
   Buyer accounts return to Discovery. A linked Seller is sent to the separate
   Seller Studio `/studio` entry, which owns its own session.

8. Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in the Buyer app and
   `STRIPE_SECRET_KEY` in the backend to matching Stripe **test** keys. Then
   enter `4242 4242 4242 4242`, any future expiry, any CVC, and a postal code:
   Stripe creates a real test PaymentIntent and the backend finalizes only a
   verified `succeeded` Intent.
9. Select **Pay <EUR/INR total> & Secure Drop**. If the item has no local
   price, checkout correctly shows **Unavailable for Purchase** and does not
   send a payment request.
10. Show the successful PawnPawn HQ handover sequence.

The Stripe test checkout mutates the local backend only after successful payment: it makes the Listing `SOLD` and
sets inventory to zero. Use a known test Listing or re-seed/reset local data
between demo runs.

## 5. Verification checklist

```bash
npm run lint
npm run build
```

`npm run build` deliberately uses Next.js webpack mode. It is the verified
production build path for this project’s Tailwind/PostCSS pipeline; the local
Next 16 Turbopack build can be blocked by restricted environments that prevent
its CSS worker from binding a local process port.

The theme is configured in `tailwind.config.ts` and `app/globals.css`. Change
the four core variables (`--theme-bg-base`, `--theme-text-primary`,
`--theme-accent`, `--theme-editorial`) to re-theme the entire buyer UI; do not
hard-code replacement colors in page or component files.

- [ ] `GET /store/products` produces at least one available card.
- [ ] Seller profile shows public profile and active inventory.
- [ ] Product attributes and lineage timeline render without buyer PII.
- [ ] Cart allows each Variant only once and survives a client refresh.
- [ ] Switching EU/India reloads a regional catalog, changes price formatting,
  and uses a separate cart.
- [ ] Missing or zero regional prices show `Unavailable` and cannot submit
  checkout or Stripe validation.
- [ ] `/login` authenticates a buyer and Checkout recognizes the current-tab session.
- [ ] Stripe test card validation works when a valid publishable key is configured; offline preview collects no card data when absent.
- [ ] Backend confirms SOLD Listing, zero stock, one HQ row, and one lineage row.

## 6. Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| Empty discovery feed | Backend stopped, no `AVAILABLE` Listing, wrong URL/key | Check `/health`, backend seed, Listing review state, `.env.local` |
| Checkout 401 | Missing/expired customer JWT | Sign in at /login to obtain a fresh Customer token |
| Checkout 409 | Piece sold or no longer stocked | Refresh discovery; choose another available drop |
| Checkout CORS failure | Backend CORS missing port 3000 or auth headers | Update backend Store CORS settings, restart backend |
| Seller/product 404 | Handle/ID absent from public catalog | Use an active seller and an available Product ID |
| Port 3000 in use | Existing local app process | Stop it or run `next dev -p <port>` and align CORS if needed |
