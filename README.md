# Poke Pulls

A static storefront and scoop simulator for a mystery Pokemon-card bead pull concept.

Each bead represents one card. Buyers pick a rarity tier, then the bead colors reveal which card elements to pack.

## Local Preview

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Commerce Setup

Checkout is intentionally disabled until a real provider is configured.

Edit `commerce-config.js` and set:

- `shopify.enabled` to `true`
- `shopify.domain` to the Shopify store domain
- `shopify.storefrontAccessToken` to the Storefront API token
- `shopify.products` values to the Shopify variant IDs for each scoop

Email signup is also disabled until `emailSignupEndpoint` is configured.
