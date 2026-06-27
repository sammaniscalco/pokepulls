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

function energyIcon(name) {
  const icons = {
    Fire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.8 2.6c.4 2.8-.7 4.5-2 5.9-.9 1-1.5 1.8-1.1 3.2 1.4-.6 2.2-1.6 2.6-3.1 2.3 1.5 3.8 3.7 3.8 6.3 0 3.5-2.5 6.1-5.8 6.1s-5.9-2.4-5.9-5.8c0-2.7 1.6-4.6 3.1-6.4 1.4-1.6 2.7-3.2 2.4-5.8 1.1.4 2 .9 2.9 1.6Z"/></svg>',
    Water: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7S5.8 9.4 5.8 14.3A6.2 6.2 0 0 0 12 20.5a6.2 6.2 0 0 0 6.2-6.2C18.2 9.4 12 2.7 12 2.7Zm-3.2 12c.6 1.6 1.7 2.5 3.3 2.7-2.6.7-4.7-.9-4.7-3.5.5.2 1 .5 1.4.8Z"/></svg>',
    Grass: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 3.2C12.1 3.4 5 7.2 5 14.1c0 1.1.3 2.1.8 2.9l-2.1 2.1 1.8 1.8 2-2c1 .7 2.2 1 3.5 1 6.1 0 9.2-6.2 9.8-16.7Zm-4.4 4.5c-2.7 1.2-5.1 2.9-7.1 5.1 1.4-2.8 3.6-4.6 7.1-5.1Z"/></svg>',
    Lightning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 2 5.7 13.1h5.1L9.8 22l8.5-12.3h-5.4L13.5 2Z"/></svg>',
    Psychic: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5.1c-5.2 0-8.7 6.9-8.7 6.9s3.5 6.9 8.7 6.9 8.7-6.9 8.7-6.9S17.2 5.1 12 5.1Zm0 10.5A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Zm0-2.1a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg>',
    Fighting: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 11.2V6.4a1.4 1.4 0 0 1 2.8 0v4h.8V5.2a1.4 1.4 0 0 1 2.8 0v5.2h.8V6.7a1.4 1.4 0 0 1 2.8 0v5.1c1.2.4 2 1.6 2 3v.9c0 3.2-2.5 5.6-6 5.6h-1.8c-3.4 0-6.5-2.7-6.5-6v-2.7c0-1.1.8-2 1.9-2 .2 0 .3 0 .4.1v.5Z"/></svg>',
    Darkness: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.6A8.6 8.6 0 0 1 8.4 3.5 8.8 8.8 0 1 0 20.5 15.6Z"/></svg>',
    Metal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.1 3.2 3.8-.7.9 3.7 3.2 2.1-2.1 3.2.7 3.8-3.7.9-2.1 3.2-3.2-2.1-3.8.7-.9-3.7-3.2-2.1 2.1-3.2-.7-3.8 3.7-.9L12 2.8Zm0 6a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"/></svg>'
  };

  return icons[name] || "";
}

function beadContents(element) {
  return `${energyIcon(element.name)}<span class="sr-only">${element.name}</span>`;
}

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
          <span><b class="bead ${element.className}">${beadContents(element)}</b>${name}</span>
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
    return `<span class="globe-bead ${element.className}" style="--x: ${12 + ((index * 23) % 76)}%; --y: ${12 + ((index * 37) % 70)}%; --s: ${0.72 + (index % 5) * 0.07};">${beadContents(element)}</span>`;
  });

  machineGlobe.innerHTML = preview.join("");
}

function renderTray(pull) {
  if (!machineTray) return;

  machineTray.innerHTML = `
    <div class="pour-stream" aria-hidden="true">
      ${pull
        .slice(0, 18)
        .map((element, index) => `<span class="stream-bead ${element.className}" style="--i: ${index}; --x: ${(index % 6) - 2.5};">${beadContents(element)}</span>`)
        .join("")}
    </div>
    <div class="settled-rows">
      ${pull
        .map(
          (element, index) => `
            <span class="settled-bead ${element.className}" style="--i: ${index}">
              ${beadContents(element)}
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
