# Poke Pulls

A static storefront and scoop simulator for a mystery Pokemon-card bead pull concept.

Each bead represents one card. Buyers pick a rarity tier, then the bead colors reveal which card elements to pack.

## Local Preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Stripe Commerce Setup

Checkout uses Stripe Checkout through the Vercel serverless route at `api/create-checkout-session.js`.

Set these Vercel environment variables before accepting real orders:

- `STRIPE_SECRET_KEY`
- `STRIPE_COMMON_PRICE_ID`
- `STRIPE_HOLO_PRICE_ID`
- `STRIPE_EX_PRICE_ID`
- `STRIPE_PACK_PRICE_ID`
- `SITE_URL` set to `https://pokepulls.vercel.app`

Email signup is also disabled until `emailSignupEndpoint` is configured.
