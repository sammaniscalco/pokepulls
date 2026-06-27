const Stripe = require("stripe");

const products = {
  common: {
    name: "Common Scoop",
    priceEnv: "STRIPE_COMMON_PRICE_ID"
  },
  holo: {
    name: "Common + Holo Scoop",
    priceEnv: "STRIPE_HOLO_PRICE_ID"
  },
  ex: {
    name: "Common + EX Scoop",
    priceEnv: "STRIPE_EX_PRICE_ID"
  },
  pack: {
    name: "Common + Pack Scoop",
    priceEnv: "STRIPE_PACK_PRICE_ID"
  }
};

function siteUrl(req) {
  const configured = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    res.status(500).json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY and Stripe price IDs in Vercel environment variables."
    });
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    res.status(400).json({ error: "Invalid JSON request body." });
    return;
  }

  const productId = String(body.productId || "");
  const product = products[productId];
  const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));

  if (!product) {
    res.status(400).json({ error: "Unknown product selected." });
    return;
  }

  const priceId = process.env[product.priceEnv];

  if (!priceId) {
    res.status(500).json({
      error: `Stripe price is not configured for ${product.name}. Add ${product.priceEnv} in Vercel.`
    });
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const baseUrl = siteUrl(req);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity
        }
      ],
      shipping_address_collection: {
        allowed_countries: ["US"]
      },
      metadata: {
        product_id: productId,
        product_name: product.name,
        quantity: String(quantity)
      },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel?product=${encodeURIComponent(productId)}`
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    res.status(500).json({
      error: "Unable to create Stripe Checkout session. Please try again later."
    });
  }
};
