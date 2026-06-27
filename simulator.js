const elements = [
  { name: "Fire", className: "bead-fire", color: "#e85043" },
  { name: "Water", className: "bead-water", color: "#2777c6" },
  { name: "Grass", className: "bead-grass", color: "#3d9a52" },
  { name: "Lightning", className: "bead-lightning", color: "#f3bd3e" },
  { name: "Psychic", className: "bead-psychic", color: "#7665c9" },
  { name: "Fighting", className: "bead-fighting", color: "#b66b33" },
  { name: "Darkness", className: "bead-dark", color: "#333333" },
  { name: "Metal", className: "bead-metal", color: "#9aa3ad" }
];

const tiers = {
  common: {
    label: "Common Builder",
    beads: 30,
    rule: "Pack common cards for each bead"
  },
  uncommon: {
    label: "Common + Uncommon",
    beads: 25,
    rule: "Mix common and uncommon cards for each bead"
  },
  rare: {
    label: "Rare Hunt",
    beads: 18,
    rule: "Pack rare-tier cards from the pulled elements"
  },
  holo: {
    label: "Holo Hit",
    beads: 20,
    rule: "One pulled bead becomes the sleeved holo or reverse-holo"
  },
  jackpot: {
    label: "Collector Jackpot",
    beads: 50,
    rule: "Pack one card per bead, then add sleeves and a bonus extra"
  }
};

const form = document.querySelector("[data-scoop-form]");
const tierSelect = form.querySelector('select[name="tier"]');
const beadCount = document.querySelector("[data-bead-count]");
const resultTitle = document.querySelector("[data-result-title]");
const stage = document.querySelector("[data-scoop-stage]");
const beadList = document.querySelector("[data-bead-list]");
const cardList = document.querySelector("[data-card-list]");
const resetButton = document.querySelector("[data-reset-scoop]");

function chooseElement() {
  return elements[Math.floor(Math.random() * elements.length)];
}

function summarizePull(pull) {
  return pull.reduce((summary, element) => {
    summary[element.name] = (summary[element.name] || 0) + 1;
    return summary;
  }, {});
}

function renderEmptyState() {
  resultTitle.textContent = "Ready to scoop";
  stage.innerHTML = '<p>Press “Scoop beads” to reveal one card element per bead.</p>';
  beadList.innerHTML = "";
  cardList.innerHTML = "";
}

function renderPull(pull, tier) {
  const summary = summarizePull(pull);

  resultTitle.textContent = `${tier.label}: ${pull.length} beads = ${pull.length} cards`;

  stage.innerHTML = pull
    .map(
      (element, index) => `
        <span class="pulled-bead ${element.className}" style="--delay: ${index * 18}ms">
          <span class="sr-only">${element.name}</span>
        </span>
      `
    )
    .join("");

  beadList.innerHTML = Object.entries(summary)
    .map(([name, count]) => {
      const element = elements.find((item) => item.name === name);
      return `
        <div class="bead-row">
          <span><b class="bead ${element.className}"></b>${name}</span>
          <strong>${count}</strong>
        </div>
      `;
    })
    .join("");

  cardList.innerHTML = Object.entries(summary)
    .map(
      ([name, count]) => `
        <div class="card-row">
          <span>${name} ${count === 1 ? "card" : "cards"}</span>
          <strong>${count}</strong>
        </div>
      `
    )
    .join("");

  cardList.insertAdjacentHTML(
    "beforeend",
    `
      <div class="card-row bonus-row">
        <span>${tier.rule}</span>
        <strong>Tier rule</strong>
      </div>
    `
  );
}

function runScoop() {
  const data = new FormData(form);
  const tier = tiers[data.get("tier")];
  const pull = Array.from({ length: tier.beads }, chooseElement);
  renderPull(pull, tier);
}

function updateTierCount() {
  const tier = tiers[tierSelect.value];
  beadCount.textContent = `${tier.beads} beads = ${tier.beads} cards`;
}

tierSelect.addEventListener("change", updateTierCount);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runScoop();
});

resetButton.addEventListener("click", renderEmptyState);

renderEmptyState();
updateTierCount();
