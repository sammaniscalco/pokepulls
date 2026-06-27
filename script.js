const products = [
  {
    name: "Common Mystery Scoop",
    type: "starter",
    price: 8,
    count: "30 beads / 30 cards",
    accent: "#3d9a52",
    bg: "#e4f6e9",
    icons: ["C", "?", "+"],
    description: "A budget scoop of commons. Bead colors randomly decide the element mix."
  },
  {
    name: "Common + Uncommon Scoop",
    type: "starter",
    price: 12,
    count: "25 beads / 25 cards",
    accent: "#2777c6",
    bg: "#e5f4ff",
    icons: ["C", "U", "?"],
    description: "A balanced binder-builder scoop with commons, uncommons, and mystery elements."
  },
  {
    name: "Rare Mystery Scoop",
    type: "rare",
    price: 14,
    count: "18 beads / 18 cards",
    accent: "#7665c9",
    bg: "#eeeafd",
    icons: ["R", "*", "?"],
    description: "Smaller count, stronger tier: includes rare cards plus bead-selected elements."
  },
  {
    name: "Reverse Holo Chance Scoop",
    type: "rare",
    price: 18,
    count: "16 beads / 16 cards",
    accent: "#1f9e9a",
    bg: "#e3faf8",
    icons: ["H", "R", "?"],
    description: "A rare-tier mystery scoop with at least one sleeved reverse-holo or holo card."
  },
  {
    name: "Mini Mystery Scoop",
    type: "starter",
    price: 5,
    count: "15 beads / 15 cards",
    accent: "#f3bd3e",
    bg: "#fff4c8",
    icons: ["?", "C", "+"],
    description: "A quick add-on scoop for younger buyers who want a low-cost surprise."
  },
  {
    name: "Holo Hit Scoop",
    type: "premium",
    price: 24,
    count: "20 beads / 20 cards",
    accent: "#d94b82",
    bg: "#ffe5ef",
    icons: ["H", "*", "+"],
    description: "Premium mystery scoop with a guaranteed sleeved holo, reverse-holo, or shiny-style card."
  },
  {
    name: "Trainer Bonus Scoop",
    type: "starter",
    price: 7,
    count: "30 beads / 30 cards",
    accent: "#333333",
    bg: "#ededed",
    icons: ["T", "I", "+"],
    description: "Trainer, item, and support cards added around the bead-revealed element mix."
  },
  {
    name: "Collector Jackpot Scoop",
    type: "premium",
    price: 32,
    count: "50 beads / 50 cards",
    accent: "#e85043",
    bg: "#ffe8df",
    icons: ["P", "*", "+"],
    description: "The big gift scoop: mixed rarities, bead-randomized elements, sleeves, and bonus extras."
  }
];

const cart = [];
const productGrid = document.querySelector("[data-products]");
const filters = document.querySelectorAll("[data-filter]");
const cartEl = document.querySelector("[data-cart]");
const cartItems = document.querySelector("[data-cart-items]");
const cartCount = document.querySelector("[data-cart-count]");
const cartTotal = document.querySelector("[data-cart-total]");

function money(value) {
  return `$${value}`;
}

function renderProducts(filter = "all") {
  const visibleProducts = filter === "all" ? products : products.filter((product) => product.type === filter);

  productGrid.innerHTML = visibleProducts
    .map((product, index) => {
      const tokens = product.icons
        .map((icon) => `<span class="token">${icon}</span>`)
        .join("");

      return `
        <article class="product-card" style="--accent: ${product.accent}; --art-bg: ${product.bg}">
          <div class="product-art" aria-hidden="true">
            <div class="token-stack">
              ${tokens}
              <span class="card-mini"></span>
            </div>
          </div>
          <div class="product-body">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-meta">
              <div>
                <span class="price">${money(product.price)}</span>
                <p>${product.count}</p>
              </div>
              <button class="add-button" type="button" data-add="${products.indexOf(product)}">Add</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCart() {
  cartCount.textContent = cart.length;
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = money(total);

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is ready for a scoop.</p>";
    return;
  }

  cartItems.innerHTML = cart
    .map(
      (item, index) => `
        <div class="cart-line">
          <div>
            <strong>${item.name}</strong>
            <span>${item.count}</span>
          </div>
          <span>${money(item.price)}</span>
          <button class="add-button" type="button" data-remove="${index}">Remove</button>
        </div>
      `
    )
    .join("");
}

function openCart() {
  cartEl.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartEl.setAttribute("aria-hidden", "true");
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    filters.forEach((filter) => filter.classList.remove("is-active"));
    button.classList.add("is-active");
    renderProducts(button.dataset.filter);
  });
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  cart.push(products[Number(button.dataset.add)]);
  renderCart();
  openCart();
});

document.querySelector("[data-cart-open]").addEventListener("click", openCart);
document.querySelector("[data-cart-close]").addEventListener("click", closeCart);

cartEl.addEventListener("click", (event) => {
  if (event.target === cartEl) closeCart();

  const removeButton = event.target.closest("[data-remove]");
  if (!removeButton) return;

  cart.splice(Number(removeButton.dataset.remove), 1);
  renderCart();
});

document.querySelector(".signup form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
});

renderProducts();
renderCart();
