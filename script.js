const products = window.POKE_PULLS_PRODUCTS || [];
const config = window.POKE_PULLS_CONFIG || {};
const productGrid = document.querySelector("[data-products]");
const filters = document.querySelectorAll("[data-filter]");
const setupNotice = document.querySelector("[data-checkout-setup]");
const signupForm = document.querySelector("[data-signup-form]");

function money(value) {
  return `$${value}`;
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

  setupNotice.hidden = false;
  setupNotice.innerHTML = `
    <strong>Secure checkout:</strong>
    Purchases redirect to Stripe Checkout. Poke Pulls never collects or stores card data on this site.
    If checkout is not configured yet, Stripe setup errors will appear here.
  `;
}

function setCheckoutMessage(message, isError = false) {
  if (!setupNotice) return;
  setupNotice.hidden = false;
  setupNotice.classList.toggle("is-error", isError);
  setupNotice.textContent = message;
}

function renderProducts(filter = "all") {
  if (!productGrid) return;

  const visibleProducts = filter === "all" ? products : products.filter((product) => product.type === filter);

  productGrid.innerHTML = visibleProducts
    .map((product) => {
      const tokens = product.icons.map((icon) => `<span class="token">${icon}</span>`).join("");
      const action = `
        <label class="quantity-control">
          Qty
          <select data-quantity-for="${product.id}">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </label>
        <button class="add-button" type="button" data-checkout-product="${product.id}">Checkout with Stripe</button>
      `;

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

  const productId = checkout.dataset.checkoutProduct;
  const product = products.find((item) => item.id === productId);
  const card = checkout.closest("[data-product-card]");
  const quantity = card?.querySelector("[data-quantity-for]")?.value || "1";

  trackEvent("checkout_clicked", { productId, quantity });
  startCheckout(checkout, product, quantity);
});

async function startCheckout(button, product, quantity) {
  if (!product) {
    setCheckoutMessage("Unable to find that product. Please refresh and try again.", true);
    return;
  }

  button.disabled = true;
  button.textContent = "Opening Stripe...";
  setCheckoutMessage("Creating a secure Stripe Checkout session...");

  try {
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ productId: product.id, quantity: Number(quantity) })
    });
    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || "Checkout could not be started.");
    }

    window.location.href = data.url;
  } catch (error) {
    setCheckoutMessage(error.message || "Checkout could not be started. Please try again.", true);
    button.disabled = false;
    button.textContent = "Checkout with Stripe";
  }
}

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
    status.textContent = "Email signup is not connected yet. Add a Formspree, Resend, Mailchimp, or Resend endpoint in commerce-config.js.";
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
