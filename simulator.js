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
const machine = document.querySelector("[data-machine]");
const machineGlobe = document.querySelector("[data-machine-globe]");
const machineTray = document.querySelector("[data-machine-tray]");
const machineKnob = document.querySelector("[data-machine-knob]");
let isRunning = false;

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
  machine?.classList.remove("is-turning", "has-pull");
  renderGlobePreview();
  machineTray.innerHTML = "<p>Turn the knob to pour beads into rows.</p>";
  beadList.innerHTML = "";
  cardList.innerHTML = "";
}

function renderPull(pull, tier) {
  const summary = summarizePull(pull);

  resultTitle.textContent = `${tier.label}: ${pull.length} beads = ${pull.length} cards`;

  renderTray(pull);

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

function renderGlobePreview() {
  if (!machineGlobe) return;

  const preview = Array.from({ length: 34 }, (_, index) => {
    const element = elements[index % elements.length];
    return `<span class="globe-bead ${element.className}" style="--x: ${12 + ((index * 23) % 76)}%; --y: ${12 + ((index * 37) % 70)}%; --s: ${0.72 + (index % 5) * 0.07};"></span>`;
  });

  machineGlobe.innerHTML = preview.join("");
}

function renderTray(pull) {
  if (!machineTray) return;

  machineTray.innerHTML = `
    <div class="pour-stream" aria-hidden="true">
      ${pull
        .slice(0, 18)
        .map((element, index) => `<span class="stream-bead ${element.className}" style="--i: ${index}; --x: ${(index % 6) - 2.5};"></span>`)
        .join("")}
    </div>
    <div class="settled-rows">
      ${pull
        .map(
          (element, index) => `
            <span class="settled-bead ${element.className}" style="--i: ${index}">
              <span class="sr-only">${element.name}</span>
            </span>
          `
        )
        .join("")}
    </div>
  `;
}

function playMachineSound() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  const ctx = new AudioContext();
  const start = ctx.currentTime;

  function tone(freq, time, duration, type = "square", volume = 0.05) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start + time);
    gain.gain.setValueAtTime(0.0001, start + time);
    gain.gain.exponentialRampToValueAtTime(volume, start + time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + time + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start + time);
    osc.stop(start + time + duration + 0.02);
  }

  tone(180, 0, 0.09);
  tone(120, 0.11, 0.1);
  tone(210, 0.23, 0.08);
  tone(420, 0.42, 0.08, "triangle", 0.04);

  setTimeout(() => ctx.close(), 900);
}

function runScoop({ withSound = false } = {}) {
  if (isRunning) return;
  isRunning = true;

  const data = new FormData(form);
  const tier = tiers[data.get("tier")];
  const pull = Array.from({ length: tier.beads }, chooseElement);

  if (withSound) playMachineSound();

  machine?.classList.remove("has-pull");
  machine?.classList.add("is-turning");
  machineTray.innerHTML = "<p>Turning...</p>";

  setTimeout(() => {
    renderPull(pull, tier);
    machine?.classList.add("has-pull");
  }, 620);

  setTimeout(() => {
    machine?.classList.remove("is-turning");
    isRunning = false;
  }, 1450);
}

function updateTierCount() {
  const tier = tiers[tierSelect.value];
  beadCount.textContent = `${tier.beads} beads = ${tier.beads} cards`;
}

tierSelect.addEventListener("change", updateTierCount);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runScoop({ withSound: true });
});

resetButton.addEventListener("click", renderEmptyState);
machineKnob?.addEventListener("click", () => runScoop({ withSound: true }));

renderEmptyState();
updateTierCount();
