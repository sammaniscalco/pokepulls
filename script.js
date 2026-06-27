const products = window.POKE_PULLS_PRODUCTS || [];
const config = window.POKE_PULLS_CONFIG || {};
const productGrid = document.querySelector("[data-products]");
const filters = document.querySelectorAll("[data-filter]");
const setupNotice = document.querySelector("[data-checkout-setup]");
const signupForm = document.querySelector("[data-signup-form]");

function money(value) {
  return `$${value}`;
}

function isShopifyConfigured() {
  const shopify = config.shopify || {};
  const productIds = shopify.products || {};
  return Boolean(
    shopify.enabled &&
      shopify.domain &&
      shopify.storefrontAccessToken &&
      products.every((product) => productIds[product.id])
  );
}

function trackEvent(name, detail = {}) {
  const payload = { name, detail, ts: new Date().toISOString() };

  if (config.analyticsProvider === "gtag" && typeof window.gtag === "function") {
    window.gtag("event", name, detail);
    return;
  }

  if (config.analyticsProvider === "plausible" && typeof window.plausible === "function") {
    window.plausible(name, { props: detail });
    return;
  }

  if (config.analyticsEndpoint) {
    navigator.sendBeacon?.(config.analyticsEndpoint, JSON.stringify(payload));
  }
}

function renderSetupNotice() {
  if (!setupNotice) return;

  if (isShopifyConfigured()) {
    setupNotice.hidden = true;
    return;
  }

  setupNotice.hidden = false;
  setupNotice.innerHTML = `
    <strong>Checkout setup needed:</strong>
    Add Shopify Buy Button values in <code>commerce-config.js</code> to show real checkout buttons.
    Payment details are never collected on this site.
  `;
}

function checkoutUrl(product, quantity = 1) {
  const shopify = config.shopify || {};
  const shop = String(shopify.domain || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const productId = shopify.products?.[product.id];

  if (!isShopifyConfigured() || !shop || !productId) return "";

  return `https://${shop}/cart/${productId}:${quantity}`;
}

function renderProducts(filter = "all") {
  if (!productGrid) return;

  const checkoutReady = isShopifyConfigured();
  const visibleProducts = filter === "all" ? products : products.filter((product) => product.type === filter);

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const tokens = product.icons.map((icon) => `<span class="token">${icon}</span>`).join("");
      const action = checkoutReady
        ? `
          <label class="quantity-control">
            Qty
            <select data-quantity-for="${product.id}">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </label>
          <a class="add-button" href="${checkoutUrl(product)}" data-checkout-product="${product.id}">Checkout</a>
        `
        : `<span class="setup-chip">Checkout unavailable until Shopify is configured.</span>`;

      return `
        <article class="product-card" id="${product.id}-scoop" style="--accent: ${product.accent}; --art-bg: ${product.bg}" data-product-card="${product.id}">
          <div class="product-art" aria-hidden="true">
            <div class="token-stack">
              ${tokens}
              <span class="card-mini"></span>
            </div>
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <dl class="product-facts">
              <div><dt>Price</dt><dd>${money(product.price)}</dd></div>
              <div><dt>Cards</dt><dd>${product.cards} beads / ${product.cards} cards</dd></div>
              <div><dt>Guarantee</dt><dd>${product.rarityGuarantee}</dd></div>
              <div><dt>Condition</dt><dd>${product.condition}</dd></div>
              <div><dt>Shipping</dt><dd>${product.shipping}</dd></div>
            </dl>
            <p class="fine-print">${product.noGuarantee}</p>
            <div class="product-meta">
              <span class="price">${money(product.price)}</span>
              ${action}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  visibleProducts.forEach((product) => trackEvent("product_viewed", { productId: product.id, name: product.name }));
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((filter) => filter.classList.remove("is-active"));
    button.classList.add("is-active");
    renderProducts(button.dataset.filter);
  });
});

productGrid?.addEventListener("click", (event) => {
  const checkout = event.target.closest("[data-checkout-product]");
  if (!checkout) return;
  trackEvent("checkout_clicked", { productId: checkout.dataset.checkoutProduct });
});

productGrid?.addEventListener("change", (event) => {
  const quantity = event.target.closest("[data-quantity-for]");
  if (!quantity) return;

  const product = products.find((item) => item.id === quantity.dataset.quantityFor);
  const card = quantity.closest("[data-product-card]");
  const checkout = card?.querySelector("[data-checkout-product]");
  if (!product || !checkout) return;

  checkout.href = checkoutUrl(product, quantity.value);
});

document.querySelectorAll("details").forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (detail.open) {
      trackEvent("faq_opened", { question: detail.querySelector("summary")?.textContent || "" });
    }
  });
});

signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = signupForm.querySelector("[data-signup-status]");
  const formData = new FormData(signupForm);
  const email = formData.get("email");

  trackEvent("email_signup", { configured: Boolean(config.emailSignupEndpoint) });

  if (!config.emailSignupEndpoint) {
    status.textContent = "Email signup is not connected yet. Add a Formspree, Resend, Mailchimp, or Shopify endpoint in commerce-config.js.";
    return;
  }

  try {
    const response = await fetch(config.emailSignupEndpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: formData
    });

    if (!response.ok) throw new Error("Signup failed");

    signupForm.reset();
    status.textContent = `Thanks. ${email} has been added to the drop list.`;
  } catch {
    status.textContent = "Signup could not be completed. Please try again later.";
  }
});

renderSetupNotice();
renderProducts();
