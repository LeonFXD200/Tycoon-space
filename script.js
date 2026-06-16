const SAVE_KEY = "blackMarketSpaceStationWalkaboutSave";
const LEGACY_SAVE_KEY = "blackMarketSpaceStationTycoonSave";
const VERSION = 2;
const ENDING_TARGET = 1_000_000;
const TILE = 32;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;
const STEP_MS = 120;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const modules = [
  {
    id: "dockingBay",
    name: "Docking Bay",
    code: "DB",
    type: "legal",
    unlockRep: 0,
    cost: 0,
    baseIncome: 9,
    repGain: 0.11,
    heat: 0.04,
    power: 1,
    crew: 1,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#2a7bd1",
    description: "A patched refuelling dock for pilots who prefer quiet invoices.",
    room: { x: 1, y: 3, w: 7, h: 7, doorX: 8, doorY: 6 },
    task: {
      label: "Refuel shady freighter",
      credits: 84,
      rep: 1.2,
      heat: 1.2,
      energy: 8,
      cooldown: 6,
      done: "The freighter leaves topped up and grateful enough to overpay."
    }
  },
  {
    id: "repairShop",
    name: "Repair Shop",
    code: "RS",
    type: "legal",
    unlockRep: 8,
    cost: 420,
    baseIncome: 22,
    repGain: 0.07,
    heat: -0.02,
    power: 2,
    crew: 2,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#2eb67d",
    description: "Safe repairs that make the station look almost respectable.",
    room: { x: 9, y: 1, w: 7, h: 6, doorX: 12, doorY: 7 },
    task: {
      label: "Patch hull plating",
      credits: 150,
      rep: 1.8,
      heat: -0.5,
      energy: 10,
      cooldown: 8,
      done: "A courier drone leaves with fresh plating and a less dramatic wobble."
    }
  },
  {
    id: "alienBar",
    name: "Alien Bar",
    code: "AB",
    type: "grey",
    unlockRep: 18,
    cost: 920,
    baseIncome: 38,
    repGain: 0.16,
    heat: 0.12,
    power: 2,
    crew: 2,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#8b5cf6",
    description: "Blue noodles, loud rumors, and customers with too many elbows.",
    room: { x: 17, y: 1, w: 7, h: 6, doorX: 20, doorY: 7 },
    task: {
      label: "Serve neon noodles",
      credits: 230,
      rep: 3.2,
      heat: 1.8,
      energy: 12,
      cooldown: 10,
      done: "The bar erupts in applause, hissing, and one tasteful cloud of steam."
    }
  },
  {
    id: "fakeId",
    name: "Fake ID Office",
    code: "ID",
    type: "illegal",
    unlockRep: 34,
    cost: 2200,
    baseIncome: 92,
    repGain: 0.09,
    heat: 0.36,
    power: 2,
    crew: 2,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#ff5c9a",
    description: "Cartoonishly suspicious paperwork for travelers with flexible names.",
    room: { x: 24, y: 3, w: 5, h: 6, doorX: 23, doorY: 6 },
    task: {
      label: "Print holo passes",
      credits: 520,
      rep: 2.4,
      heat: 4.5,
      energy: 14,
      cooldown: 12,
      done: "A stack of fictional space paperwork pays nicely and glows too brightly."
    }
  },
  {
    id: "smugglingTunnel",
    name: "Smuggling Tunnel",
    code: "ST",
    type: "illegal",
    unlockRep: 62,
    cost: 6800,
    baseIncome: 230,
    repGain: 0.18,
    heat: 0.78,
    power: 3,
    crew: 3,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#ef4444",
    description: "A hidden cargo tube where manifests go to become poetry.",
    room: { x: 23, y: 11, w: 6, h: 4, doorX: 22, doorY: 13 },
    task: {
      label: "Route sealed cargo",
      credits: 1250,
      rep: 5.5,
      heat: 9,
      energy: 18,
      cooldown: 16,
      done: "The sealed cargo slides through the tube while every scanner looks away."
    }
  },
  {
    id: "securityOffice",
    name: "Security Office",
    code: "SO",
    type: "legal",
    unlockRep: 25,
    cost: 1600,
    baseIncome: 0,
    repGain: 0.04,
    heat: -0.03,
    power: 1,
    crew: 2,
    security: 12,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#22c55e",
    description: "Bored guards, loud alarms, and bristling checkpoint doors.",
    room: { x: 1, y: 11, w: 7, h: 7, doorX: 8, doorY: 14 },
    task: {
      label: "Run security drill",
      credits: 0,
      rep: 1,
      heat: -7,
      energy: 12,
      cooldown: 18,
      done: "The guards practice looking busy. Patrol scanners lose interest."
    }
  },
  {
    id: "powerCore",
    name: "Power Core",
    code: "PC",
    type: "utility",
    unlockRep: 10,
    cost: 700,
    baseIncome: 0,
    repGain: 0.02,
    heat: 0.02,
    power: 0,
    crew: 1,
    security: 0,
    powerCapacity: 8,
    crewCapacity: 0,
    color: "#f59e0b",
    description: "A humming reactor that keeps the questionable lights on.",
    room: { x: 9, y: 13, w: 6, h: 6, doorX: 12, doorY: 12 },
    task: {
      label: "Tune reactor coils",
      credits: 90,
      rep: 0.6,
      heat: -1,
      energy: 8,
      cooldown: 9,
      done: "The reactor stops coughing and starts humming in a profitable key."
    }
  },
  {
    id: "crewQuarters",
    name: "Crew Quarters",
    code: "CQ",
    type: "utility",
    unlockRep: 12,
    cost: 760,
    baseIncome: 0,
    repGain: 0.03,
    heat: 0,
    power: 1,
    crew: 0,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 6,
    color: "#14b8a6",
    description: "Tiny bunks for loyal crew who ask for hazard pay in advance.",
    room: { x: 16, y: 13, w: 6, h: 6, doorX: 19, doorY: 12 },
    task: {
      label: "Rally the night crew",
      credits: 60,
      rep: 1.4,
      heat: -0.5,
      energy: -24,
      cooldown: 22,
      done: "The crew shares caf, gossip, and enough snacks to restore your focus."
    }
  },
  {
    id: "bazaar",
    name: "Black Market Bazaar",
    code: "BM",
    type: "illegal",
    unlockRep: 140,
    cost: 28000,
    baseIncome: 760,
    repGain: 0.45,
    heat: 1.25,
    power: 5,
    crew: 6,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#d946ef",
    description: "A late-night maze of glowing stalls and impossible bargains.",
    room: { x: 23, y: 15, w: 6, h: 4, doorX: 22, doorY: 17 },
    task: {
      label: "Broker oddities",
      credits: 5200,
      rep: 12,
      heat: 18,
      energy: 24,
      cooldown: 26,
      done: "A buyer trades a singing cube for a mountain of credits."
    }
  },
  {
    id: "cloakingArray",
    name: "Cloaking Array",
    code: "CA",
    type: "utility",
    unlockRep: 95,
    cost: 13500,
    baseIncome: 0,
    repGain: 0.03,
    heat: -0.42,
    power: 4,
    crew: 2,
    security: 0,
    powerCapacity: 0,
    crewCapacity: 0,
    color: "#38bdf8",
    description: "Light-bending panels that make inspectors doubt their lunch.",
    room: { x: 13, y: 8, w: 4, h: 4, doorX: 12, doorY: 10 },
    task: {
      label: "Sweep cloak signature",
      credits: 0,
      rep: 1.8,
      heat: -18,
      energy: 16,
      cooldown: 24,
      done: "NODE-13 fades from the scanner map like a guilty thought."
    }
  }
];

const eventTemplates = [
  {
    title: "Rare Ship Arrival",
    text: "A silent crystal ship docks without a transponder and asks for fuel in poetry.",
    safeLabel: "Serve by the book",
    riskyLabel: "Ask for exotic payment",
    safe(game) {
      addCredits(380 + game.incomePerSecond * 8);
      game.reputation += 4;
      logEvent("The crystal ship leaves a polite chime and a clean payment.", "good");
    },
    risky(game) {
      addCredits(1200 + game.incomePerSecond * 22);
      game.reputation += 8;
      game.heat += 9;
      logEvent("The exotic payment converts beautifully, but scanners notice the glow.", "warning");
    }
  },
  {
    title: "Nearby Inspectors",
    text: "Authority scanners sweep the sector. Every hatch suddenly sounds too loud.",
    safeLabel: "Run a spotless shift",
    riskyLabel: "Mask the station signature",
    safe(game) {
      const cost = Math.min(game.credits, 240 + game.incomePerSecond * 4);
      game.credits -= cost;
      game.heat = Math.max(0, game.heat - 12);
      logEvent(`A clean shift costs ${formatNumber(cost)} credits, and Heat drops.`, "good");
    },
    risky(game) {
      if (Math.random() < 0.55 + game.cloakStrength * 0.05) {
        game.heat = Math.max(0, game.heat - 18);
        game.reputation += 5;
        logEvent("The signature mask works. NODE-13 becomes an inconvenient rumor.", "good");
      } else {
        game.heat += 18;
        triggerRaid("Scanner mask traced");
      }
    }
  },
  {
    title: "Crew Leak",
    text: "A crew member is tempted to sell docking gossip to a passing news drone.",
    safeLabel: "Pay quiet bonus",
    riskyLabel: "Let the rumor spread",
    safe(game) {
      const cost = Math.min(game.credits, 320 + game.reputation * 3);
      game.credits -= cost;
      game.heat = Math.max(0, game.heat - 8);
      logEvent(`Quiet bonuses cost ${formatNumber(cost)} credits. The drone leaves bored.`, "good");
    },
    risky(game) {
      game.reputation += 13;
      game.heat += 11;
      logEvent("The rumor spreads fast. Reputation jumps, and so does Authority interest.", "warning");
    }
  },
  {
    title: "Mysterious AI Offer",
    text: "An antique trade AI offers to optimize one room for a price it calls symbolic.",
    safeLabel: "Decline politely",
    riskyLabel: "Accept the optimization",
    safe(game) {
      game.reputation += 2;
      logEvent("The AI thanks you for respecting boundaries and dissolves into static.", "good");
    },
    risky(game) {
      const built = getBuiltModules().filter((module) => module.id !== "dockingBay");
      if (built.length) {
        const target = built[Math.floor(Math.random() * built.length)];
        game.modules[target.id].level += 1;
        game.heat += 8;
        game.reputation += 5;
        logEvent(`${target.name} gains a free level. The AI leaves a smug beep.`, "good");
      } else {
        addCredits(500 + game.incomePerSecond * 12);
        game.heat += 8;
        logEvent("Unused bandwidth becomes credits. Mildly unsettling credits.", "warning");
      }
    }
  },
  {
    title: "Pirate Demand",
    text: "A masked caller demands docking tribute and calls it a friendship tax.",
    safeLabel: "Pay the tribute",
    riskyLabel: "Broadcast defiance",
    safe(game) {
      const cost = Math.min(game.credits, 500 + game.incomePerSecond * 8);
      game.credits -= cost;
      logEvent(`You pay ${formatNumber(cost)} credits. The pirates leave dramatically.`, "warning");
    },
    risky(game) {
      const defence = game.security + game.cloakStrength * 5;
      if (defence + Math.random() * 44 > 34) {
        game.reputation += 10;
        game.heat += 4;
        logEvent("Your defiance becomes sector gossip. Pirates back down.", "good");
      } else {
        const loss = Math.min(game.credits, 700 + game.incomePerSecond * 12);
        game.credits -= loss;
        const damage = damageRandomModule();
        logEvent(`Pirates hit a supply lockup and cost ${formatNumber(loss)} credits. ${damage}`, "raid");
      }
    }
  }
];

const storyBeats = [
  {
    title: "Rusty Purchase",
    test: (game) => game.reputation < 45,
    text: "You bought a battered station in deep space. The Docking Bay leaks fuel vapor, but pilots still dock when they want a place that does not ask questions."
  },
  {
    title: "Name in the Static",
    test: (game) => game.reputation >= 45 && game.reputation < 130,
    text: "Smugglers, strange aliens, and bargain hunters whisper NODE-13 across encrypted channels. Walking the deck now feels like managing a rumor with airlocks."
  },
  {
    title: "Major Threat",
    test: (game) => game.reputation >= 130,
    text: "The Galactic Authority has marked your station as a major threat. Traders arrive in waves, and every scanner ping sounds personal."
  }
];

const objectives = [
  { label: "Run a Docking Bay job", test: (game) => game.flags.didDockJob },
  { label: "Build two station rooms", test: (game) => getBuiltModules().length >= 3 },
  { label: "Install utility support", test: (game) => game.modules.powerCore.level > 0 && game.modules.crewQuarters.level > 0 },
  { label: "Survive or avoid an Authority sweep", test: (game) => game.flags.raidHandled },
  { label: "Unlock the Cloaking Array", test: (game) => game.reputation >= 95 },
  { label: "Earn 1,000,000 lifetime credits", test: (game) => game.totalEarned >= ENDING_TARGET }
];

const staticObjects = [
  {
    id: "buildTerminal",
    name: "Build Terminal",
    x: 11,
    y: 10,
    color: "#48e6ff",
    description: "Blueprints for new rooms flicker across a scratched holo-screen.",
    actionLabel: "Open construction ledger",
    action: () => logEvent("The build ledger is open on the right panel.", "good")
  },
  {
    id: "saveConsole",
    name: "Ledger Console",
    x: 18,
    y: 10,
    color: "#77ffb9",
    description: "A battered console stores your station ledger in this browser.",
    actionLabel: "Save station",
    action: () => {
      saveGame();
      logEvent("Station ledger saved.", "good");
    }
  },
  {
    id: "restPod",
    name: "Caf Pod",
    x: 10,
    y: 10,
    color: "#ffd36c",
    description: "A questionable caf dispenser and a chair that only squeaks sometimes.",
    actionLabel: "Recover energy",
    action: () => {
      const recovered = Math.min(game.energyMax - game.energy, 38);
      game.energy = Math.min(game.energyMax, game.energy + 38);
      logEvent(recovered > 0 ? `You recover ${Math.round(recovered)} Energy.` : "The caf pod sputters. You are already wired.", "good");
    }
  }
];

const dom = {
  creditsStat: document.getElementById("creditsStat"),
  incomeStat: document.getElementById("incomeStat"),
  heatStat: document.getElementById("heatStat"),
  heatLevel: document.getElementById("heatLevel"),
  reputationStat: document.getElementById("reputationStat"),
  securityStat: document.getElementById("securityStat"),
  powerStat: document.getElementById("powerStat"),
  crewStat: document.getElementById("crewStat"),
  energyStat: document.getElementById("energyStat"),
  tutorialBanner: document.getElementById("tutorialBanner"),
  tutorialText: document.getElementById("tutorialText"),
  dismissTutorial: document.getElementById("dismissTutorial"),
  interactionTitle: document.getElementById("interactionTitle"),
  interactionAction: document.getElementById("interactionAction"),
  focusTitle: document.getElementById("focusTitle"),
  focusDescription: document.getElementById("focusDescription"),
  primaryActionButton: document.getElementById("primaryActionButton"),
  upgradeActionButton: document.getElementById("upgradeActionButton"),
  cooldownLine: document.getElementById("cooldownLine"),
  terminalState: document.getElementById("terminalState"),
  buildList: document.getElementById("buildList"),
  raidRiskText: document.getElementById("raidRiskText"),
  raidRiskFill: document.getElementById("raidRiskFill"),
  raidAdvice: document.getElementById("raidAdvice"),
  eventLog: document.getElementById("eventLog"),
  storyTitle: document.getElementById("storyTitle"),
  storyText: document.getElementById("storyText"),
  objectiveList: document.getElementById("objectiveList"),
  saveButton: document.getElementById("saveButton"),
  resetButton: document.getElementById("resetButton"),
  choiceModal: document.getElementById("choiceModal"),
  choiceTitle: document.getElementById("choiceTitle"),
  choiceText: document.getElementById("choiceText"),
  choiceActions: document.getElementById("choiceActions"),
  endingModal: document.getElementById("endingModal"),
  endingResult: document.getElementById("endingResult"),
  continueAfterEnding: document.getElementById("continueAfterEnding"),
  alertFlash: document.getElementById("alertFlash"),
  touchAction: document.getElementById("touchAction")
};

let game;
let lastFrame = 0;
let lastStep = 0;
let nextEventAt = 0;
let raidTimer = 0;
let focusTarget = null;
const keys = new Set();

function createNewGame() {
  return {
    version: VERSION,
    credits: 180,
    totalEarned: 180,
    heat: 4,
    reputation: 0,
    energy: 100,
    energyMax: 100,
    player: { x: 11, y: 10, facing: "down" },
    modules: Object.fromEntries(modules.map((module) => [module.id, { level: module.id === "dockingBay" ? 1 : 0 }])),
    cooldowns: {},
    crates: [
      { id: "crate-a", x: 5, y: 6, available: true },
      { id: "crate-b", x: 26, y: 10, available: true },
      { id: "crate-c", x: 11, y: 17, available: true }
    ],
    flags: {
      didDockJob: false,
      raidHandled: false
    },
    tutorialStep: 0,
    endingChosen: null,
    endingSeen: false,
    alertUntil: 0,
    log: [
      {
        type: "good",
        time: Date.now(),
        message: "You step onto NODE-13 with one working Docking Bay and a suspiciously blank ledger."
      }
    ]
  };
}

function init() {
  game = loadGame() || createNewGame();
  normalizeGame();
  calculateStats();
  bindEvents();
  scheduleRandomEvent();
  renderAll();
  requestAnimationFrame(gameLoop);
  setInterval(saveGame, 10000);
}

function bindEvents() {
  window.addEventListener("keydown", (event) => {
    const direction = keyToDirection(event.key);
    if (direction) {
      event.preventDefault();
      keys.add(event.key.toLowerCase());
      movePlayer(direction);
      lastStep = performance.now();
    }
    if (event.key === "e" || event.key === "E" || event.key === " ") {
      event.preventDefault();
      useFocusedAction();
    }
    if (event.key === "u" || event.key === "U") {
      event.preventDefault();
      upgradeFocusedModule();
    }
  });

  window.addEventListener("keyup", (event) => {
    keys.delete(event.key.toLowerCase());
  });

  dom.primaryActionButton.addEventListener("click", useFocusedAction);
  dom.upgradeActionButton.addEventListener("click", upgradeFocusedModule);

  dom.buildList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action][data-module-id]");
    if (!button) return;
    if (button.dataset.action === "build") buildModule(button.dataset.moduleId);
    if (button.dataset.action === "upgrade") upgradeModule(button.dataset.moduleId);
  });

  dom.saveButton.addEventListener("click", () => {
    saveGame();
    logEvent("Station ledger saved.", "good");
    renderAll();
  });

  dom.resetButton.addEventListener("click", () => {
    if (!window.confirm("Reset NODE-13 and erase this browser save?")) return;
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LEGACY_SAVE_KEY);
    game = createNewGame();
    calculateStats();
    scheduleRandomEvent();
    renderAll();
  });

  dom.dismissTutorial.addEventListener("click", () => {
    game.tutorialStep += 1;
    renderTutorial();
    saveGame();
  });

  document.querySelectorAll("[data-ending]").forEach((button) => {
    button.addEventListener("click", () => chooseEnding(button.dataset.ending));
  });

  dom.continueAfterEnding.addEventListener("click", () => {
    dom.endingModal.classList.add("hidden");
    game.endingSeen = true;
    saveGame();
  });

  document.querySelectorAll(".touch-controls [data-dir]").forEach((button) => {
    const dir = button.dataset.dir;
    button.addEventListener("click", () => movePlayer(dir));
  });
  dom.touchAction.addEventListener("click", useFocusedAction);
  window.addEventListener("beforeunload", saveGame);
}

function gameLoop(timestamp) {
  const delta = Math.min(0.08, (timestamp - lastFrame) / 1000 || 0);
  lastFrame = timestamp;

  handleMovement(timestamp);
  updateWorld(delta);
  drawWorld(timestamp);
  requestAnimationFrame(gameLoop);
}

function handleMovement(timestamp) {
  if (timestamp - lastStep < STEP_MS) return;
  const direction = getInputDirection();
  if (!direction) return;
  movePlayer(direction);
  lastStep = timestamp;
}

function getInputDirection() {
  if (keys.has("arrowup") || keys.has("w")) return "up";
  if (keys.has("arrowdown") || keys.has("s")) return "down";
  if (keys.has("arrowleft") || keys.has("a")) return "left";
  if (keys.has("arrowright") || keys.has("d")) return "right";
  return null;
}

function keyToDirection(key) {
  const normalized = key.toLowerCase();
  if (normalized === "arrowup" || normalized === "w") return "up";
  if (normalized === "arrowdown" || normalized === "s") return "down";
  if (normalized === "arrowleft" || normalized === "a") return "left";
  if (normalized === "arrowright" || normalized === "d") return "right";
  return null;
}

function movePlayer(direction) {
  const deltas = {
    up: [0, -1],
    down: [0, 1],
    left: [-1, 0],
    right: [1, 0]
  };
  const [dx, dy] = deltas[direction];
  game.player.facing = direction;
  const nextX = game.player.x + dx;
  const nextY = game.player.y + dy;
  if (!isBlocked(nextX, nextY)) {
    game.player.x = nextX;
    game.player.y = nextY;
  }
  renderAll();
}

function updateWorld(delta) {
  calculateStats();
  addCredits(game.incomePerSecond * delta);
  game.reputation += game.reputationPerSecond * delta;
  const cloakReduction = 1 - Math.min(0.72, game.cloakStrength * 0.08);
  game.heat = clamp(game.heat + game.heatPerSecond * cloakReduction * delta - game.security * 0.002 * delta, 0, 170);
  game.energy = clamp(game.energy + 2.2 * delta, 0, game.energyMax);

  raidTimer += delta;
  if (raidTimer >= 8) {
    raidTimer = 0;
    maybeTriggerRaid();
  }

  if (Date.now() >= nextEventAt && dom.choiceModal.classList.contains("hidden")) {
    showRandomEvent();
  }

  respawnCrates();
  renderStats();
  renderFocus();
  renderRaidRisk();
  maybeShowEnding();
  dom.alertFlash.classList.toggle("hidden", Date.now() > game.alertUntil);
}

function calculateStats() {
  const built = getBuiltModules();
  const rawPowerUsed = built.reduce((sum, module) => sum + module.power * getLevel(module), 0);
  const rawCrewUsed = built.reduce((sum, module) => sum + module.crew * getLevel(module), 0);
  const powerCapacity = 8 + built.reduce((sum, module) => sum + scaled(module.powerCapacity, getLevel(module)), 0);
  const crewCapacity = 5 + built.reduce((sum, module) => sum + scaled(module.crewCapacity, getLevel(module)), 0);
  const outputFactor = rawPowerUsed > powerCapacity || rawCrewUsed > crewCapacity
    ? Math.max(0.18, Math.min(powerCapacity / Math.max(rawPowerUsed, 1), crewCapacity / Math.max(rawCrewUsed, 1)))
    : 1;

  game.powerUsed = rawPowerUsed;
  game.crewUsed = rawCrewUsed;
  game.powerCapacity = powerCapacity;
  game.crewCapacity = crewCapacity;
  game.outputFactor = outputFactor;
  game.incomePerSecond = built.reduce((sum, module) => sum + scaled(module.baseIncome, getLevel(module)), 0) * outputFactor;
  game.reputationPerSecond = built.reduce((sum, module) => sum + scaled(module.repGain, getLevel(module)), 0) * outputFactor;
  game.heatPerSecond = built.reduce((sum, module) => sum + scaled(module.heat, getLevel(module)), 0) * outputFactor;
  game.security = built.reduce((sum, module) => sum + scaled(module.security, getLevel(module)), 0);
  game.cloakStrength = getLevel(getModule("cloakingArray")) * 1.25;
}

function drawWorld(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBaseFloor();
  drawRooms();
  drawObjects(timestamp);
  drawCrates(timestamp);
  drawPlayer(timestamp);
  drawVignette();
}

function drawBaseFloor() {
  ctx.fillStyle = "#071022";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < MAP_HEIGHT; y += 1) {
    for (let x = 0; x < MAP_WIDTH; x += 1) {
      const wall = x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1;
      ctx.fillStyle = wall ? "#111827" : (x + y) % 2 === 0 ? "#0b162b" : "#0c1830";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      ctx.strokeStyle = "rgba(72, 230, 255, 0.045)";
      ctx.strokeRect(x * TILE + 0.5, y * TILE + 0.5, TILE, TILE);
    }
  }

  ctx.fillStyle = "rgba(72, 230, 255, 0.08)";
  ctx.fillRect(8 * TILE, 7 * TILE, 15 * TILE, TILE);
  ctx.fillRect(8 * TILE, 12 * TILE, 15 * TILE, TILE);
  ctx.fillRect(8 * TILE, 7 * TILE, TILE, 6 * TILE);
  ctx.fillRect(22 * TILE, 7 * TILE, TILE, 11 * TILE);
}

function drawRooms() {
  modules.forEach((module) => {
    const level = getLevel(module);
    const { x, y, w, h, doorX, doorY } = module.room;
    const px = x * TILE;
    const py = y * TILE;
    const built = level > 0;

    ctx.fillStyle = built ? withAlpha(module.color, 0.28) : "rgba(17, 24, 39, 0.72)";
    ctx.fillRect(px, py, w * TILE, h * TILE);
    ctx.strokeStyle = built ? withAlpha(module.color, 0.9) : "rgba(148, 163, 184, 0.25)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 2, py + 2, w * TILE - 4, h * TILE - 4);

    if (!built) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      for (let stripe = -h * TILE; stripe < w * TILE; stripe += 18) {
        ctx.fillRect(px + stripe, py, 6, h * TILE);
      }
    }

    ctx.fillStyle = built ? module.color : "#64748b";
    ctx.fillRect(doorX * TILE + 7, doorY * TILE + 7, TILE - 14, TILE - 14);
    ctx.fillStyle = "#ecf8ff";
    ctx.font = "700 10px ui-sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(module.code, doorX * TILE + TILE / 2, doorY * TILE + 20);

    ctx.fillStyle = built ? "#ecf8ff" : "#93a4b5";
    ctx.font = "800 11px ui-sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(module.name, px + 10, py + 18);
    ctx.fillStyle = built ? "#77ffb9" : "#ffd36c";
    ctx.fillText(built ? `LV ${level}` : `REP ${module.unlockRep}`, px + 10, py + 34);

    if (built && module.task) {
      const stationX = Math.floor(x + w / 2);
      const stationY = Math.floor(y + h / 2);
      drawConsole(stationX, stationY, module.color, module.code);
    }
  });
}

function drawObjects(timestamp) {
  staticObjects.forEach((object) => {
    drawConsole(object.x, object.y, object.color, object.id === "restPod" ? "CAF" : object.id === "saveConsole" ? "LOG" : "BLD");
  });

  ctx.fillStyle = "#f8fafc";
  ctx.font = "900 11px ui-sans-serif";
  ctx.textAlign = "center";
  const flicker = Math.sin(timestamp / 260) > 0 ? 1 : 0.55;
  ctx.globalAlpha = flicker;
  ctx.fillText("NODE-13", 15 * TILE, 9 * TILE + 10);
  ctx.globalAlpha = 1;
}

function drawConsole(x, y, color, label) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(px + 5, py + 18, TILE - 10, 8);
  ctx.fillStyle = color;
  ctx.fillRect(px + 7, py + 7, TILE - 14, TILE - 12);
  ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
  ctx.fillRect(px + 11, py + 10, TILE - 22, 5);
  ctx.fillStyle = "#071022";
  ctx.font = "800 8px ui-sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, px + TILE / 2, py + 24);
}

function drawCrates(timestamp) {
  game.crates.forEach((crate) => {
    if (!crate.available) return;
    const bob = Math.sin(timestamp / 220 + crate.x) * 2;
    const px = crate.x * TILE;
    const py = crate.y * TILE + bob;
    ctx.fillStyle = "#ffd36c";
    ctx.fillRect(px + 8, py + 9, TILE - 16, TILE - 14);
    ctx.strokeStyle = "#8a5d13";
    ctx.strokeRect(px + 8.5, py + 9.5, TILE - 17, TILE - 15);
    ctx.fillStyle = "#ecf8ff";
    ctx.fillRect(px + 13, py + 13, TILE - 26, 3);
  });
}

function drawPlayer(timestamp) {
  const px = game.player.x * TILE;
  const py = game.player.y * TILE;
  const bob = Math.sin(timestamp / 130) * 1.5;
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(px + 8, py + 24, TILE - 16, 5);
  ctx.fillStyle = "#48e6ff";
  ctx.fillRect(px + 10, py + 8 + bob, TILE - 20, 15);
  ctx.fillStyle = "#ecf8ff";
  ctx.fillRect(px + 12, py + 4 + bob, TILE - 24, 10);
  ctx.fillStyle = "#071022";
  ctx.fillRect(px + 15, py + 8 + bob, 7, 3);
  ctx.fillStyle = "#77ffb9";
  ctx.fillRect(px + 9, py + 22 + bob, 5, 6);
  ctx.fillRect(px + 18, py + 22 + bob, 5, 6);

  const [dx, dy] = facingDelta(game.player.facing);
  ctx.fillStyle = "rgba(119, 255, 185, 0.22)";
  ctx.fillRect((game.player.x + dx) * TILE + 9, (game.player.y + dy) * TILE + 9, TILE - 18, TILE - 18);
}

function drawVignette() {
  const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 120, canvas.width / 2, canvas.height / 2, canvas.width / 1.1);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.32)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function isBlocked(x, y) {
  if (x <= 0 || y <= 0 || x >= MAP_WIDTH - 1 || y >= MAP_HEIGHT - 1) return true;
  return modules.some((module) => {
    if (getLevel(module) > 0) return false;
    const { x: rx, y: ry, w, h } = module.room;
    return x >= rx && x < rx + w && y >= ry && y < ry + h;
  });
}

function useFocusedAction() {
  focusTarget = getFocusTarget();
  if (!focusTarget) {
    logEvent("The deck hums. Nothing nearby needs your attention.", "");
    renderAll();
    return;
  }

  if (focusTarget.kind === "static") {
    focusTarget.object.action();
  }
  if (focusTarget.kind === "crate") {
    collectCrate(focusTarget.crate);
  }
  if (focusTarget.kind === "module") {
    const module = focusTarget.module;
    if (getLevel(module) > 0) performModuleTask(module);
    else buildModule(module.id);
  }
  renderAll();
}

function upgradeFocusedModule() {
  focusTarget = getFocusTarget();
  if (focusTarget?.kind === "module" && getLevel(focusTarget.module) > 0) {
    upgradeModule(focusTarget.module.id);
  }
}

function performModuleTask(module) {
  const level = getLevel(module);
  const task = module.task;
  if (!task || level < 1) return;
  const now = Date.now();
  const remaining = Math.max(0, (game.cooldowns[module.id] || 0) - now);
  if (remaining > 0) {
    logEvent(`${module.name} is cycling. Try again in ${Math.ceil(remaining / 1000)}s.`, "warning");
    return;
  }

  if (game.energy < task.energy && task.energy > 0) {
    logEvent("You need more Energy for that shift.", "warning");
    return;
  }

  const multiplier = level * Math.pow(1.16, level - 1);
  const credits = Math.round(task.credits * multiplier);
  addCredits(credits);
  game.reputation += task.rep * multiplier;
  game.heat = clamp(game.heat + task.heat * multiplier, 0, 170);
  game.energy = clamp(game.energy - task.energy, 0, game.energyMax);
  game.cooldowns[module.id] = now + task.cooldown * 1000;
  if (module.id === "dockingBay") game.flags.didDockJob = true;
  logEvent(`${task.done} ${credits > 0 ? `+${formatNumber(credits)} credits.` : ""}`.trim(), module.type === "illegal" ? "warning" : "good");
}

function collectCrate(crate) {
  if (!crate.available) return;
  const gain = Math.round(90 + Math.random() * 180 + game.reputation * 1.5);
  crate.available = false;
  crate.respawnAt = Date.now() + randomInt(22000, 42000);
  addCredits(gain);
  game.reputation += 0.8;
  if (Math.random() < 0.35) game.heat += 1.5;
  logEvent(`You crack open a drifting salvage crate. +${formatNumber(gain)} credits.`, "good");
}

function buildModule(moduleId) {
  const module = getModule(moduleId);
  if (!module || getLevel(module) > 0) return;
  if (!isUnlocked(module)) {
    logEvent(`${module.name} needs ${module.unlockRep} Reputation.`, "warning");
    return;
  }
  if (game.credits < module.cost) {
    logEvent(`${module.name} costs ${formatNumber(module.cost)} credits.`, "warning");
    return;
  }
  if (!hasCapacityFor(module, 1)) {
    logEvent(`${module.name} needs more Power or Crew capacity.`, "warning");
    return;
  }
  game.credits -= module.cost;
  game.modules[module.id].level = 1;
  logEvent(`${module.name} comes online. A new hatch opens on the deck.`, module.type === "illegal" ? "warning" : "good");
  calculateStats();
  renderAll();
  saveGame();
}

function upgradeModule(moduleId) {
  const module = getModule(moduleId);
  if (!module || getLevel(module) < 1) return;
  const cost = getUpgradeCost(module);
  if (game.credits < cost) {
    logEvent(`${module.name} upgrade costs ${formatNumber(cost)} credits.`, "warning");
    return;
  }
  if (!hasCapacityFor(module, getLevel(module) + 1)) {
    logEvent(`${module.name} upgrade needs more Power or Crew capacity.`, "warning");
    return;
  }
  game.credits -= cost;
  game.modules[module.id].level += 1;
  logEvent(`${module.name} upgraded to level ${getLevel(module)}.`, "good");
  calculateStats();
  renderAll();
  saveGame();
}

function hasCapacityFor(module, targetLevel) {
  const currentLevel = getLevel(module);
  const projectedPowerUsed = game.powerUsed - module.power * currentLevel + module.power * targetLevel;
  const projectedCrewUsed = game.crewUsed - module.crew * currentLevel + module.crew * targetLevel;
  const projectedPowerCap = game.powerCapacity - scaled(module.powerCapacity, currentLevel) + scaled(module.powerCapacity, targetLevel);
  const projectedCrewCap = game.crewCapacity - scaled(module.crewCapacity, currentLevel) + scaled(module.crewCapacity, targetLevel);
  return projectedPowerUsed <= projectedPowerCap && projectedCrewUsed <= projectedCrewCap;
}

function getFocusTarget() {
  const player = game.player;
  const candidates = [];
  const addCandidate = (targetX, targetY, data) => {
    const distance = Math.abs(player.x - targetX) + Math.abs(player.y - targetY);
    const [dx, dy] = facingDelta(player.facing);
    const facingBonus = player.x + dx === targetX && player.y + dy === targetY ? -0.5 : 0;
    if (distance <= 2) candidates.push({ score: distance + facingBonus, ...data });
  };

  staticObjects.forEach((object) => addCandidate(object.x, object.y, { kind: "static", object }));
  game.crates.filter((crate) => crate.available).forEach((crate) => addCandidate(crate.x, crate.y, { kind: "crate", crate }));
  modules.forEach((module) => {
    const { doorX, doorY, x, y, w, h } = module.room;
    const targetX = getLevel(module) > 0 ? Math.floor(x + w / 2) : doorX;
    const targetY = getLevel(module) > 0 ? Math.floor(y + h / 2) : doorY;
    addCandidate(targetX, targetY, { kind: "module", module });
    addCandidate(doorX, doorY, { kind: "module", module });
  });

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0] || null;
}

function renderAll() {
  calculateStats();
  renderStats();
  renderFocus();
  renderBuildList();
  renderRaidRisk();
  renderLog();
  renderStory();
  renderObjectives();
  renderTutorial();
}

function renderStats() {
  dom.creditsStat.textContent = `${formatNumber(game.credits)} cr`;
  dom.incomeStat.textContent = `${formatNumber(game.incomePerSecond)}/s`;
  dom.heatStat.textContent = `${Math.round(game.heat)}`;
  dom.reputationStat.textContent = `${Math.floor(game.reputation)}`;
  dom.securityStat.textContent = `${Math.round(game.security)}`;
  dom.powerStat.textContent = `${Math.round(game.powerUsed)} / ${Math.round(game.powerCapacity)}`;
  dom.crewStat.textContent = `${Math.round(game.crewUsed)} / ${Math.round(game.crewCapacity)}`;
  dom.energyStat.textContent = `${Math.round(game.energy)} / ${game.energyMax}`;

  const heat = getHeatLevel();
  dom.heatLevel.textContent = heat.label;
  dom.heatLevel.className = heat.className;
}

function renderFocus() {
  focusTarget = getFocusTarget();
  let title = "Central Deck";
  let description = "The station hums under your boots.";
  let action = "Walk around NODE-13";
  let canPrimary = false;
  let canUpgrade = false;
  let cooldownText = "";

  if (focusTarget?.kind === "static") {
    const { object } = focusTarget;
    title = object.name;
    description = object.description;
    action = object.actionLabel;
    canPrimary = true;
  }

  if (focusTarget?.kind === "crate") {
    title = "Salvage Crate";
    description = "A loose crate from a ship that definitely meant to keep it.";
    action = "Crack it open";
    canPrimary = true;
  }

  if (focusTarget?.kind === "module") {
    const module = focusTarget.module;
    const level = getLevel(module);
    title = module.name;
    description = module.description;
    if (level > 0) {
      action = module.task.label;
      canPrimary = true;
      canUpgrade = game.credits >= getUpgradeCost(module) && hasCapacityFor(module, level + 1);
      const remaining = Math.max(0, (game.cooldowns[module.id] || 0) - Date.now());
      if (remaining > 0) cooldownText = `Cycling: ${Math.ceil(remaining / 1000)}s`;
    } else {
      action = isUnlocked(module) ? `Build for ${formatNumber(module.cost)} credits` : `Needs ${module.unlockRep} Reputation`;
      canPrimary = isUnlocked(module) && game.credits >= module.cost && hasCapacityFor(module, 1);
    }
  }

  dom.interactionTitle.textContent = title;
  dom.interactionAction.textContent = action;
  dom.focusTitle.textContent = title;
  dom.focusDescription.textContent = description;
  document.body.dataset.playerTile = `${game.player.x},${game.player.y}`;
  document.body.dataset.focus = title;
  dom.primaryActionButton.textContent = action;
  dom.primaryActionButton.disabled = !canPrimary;
  dom.upgradeActionButton.disabled = !canUpgrade;
  dom.upgradeActionButton.textContent = canUpgrade && focusTarget?.kind === "module"
    ? `Upgrade ${formatNumber(getUpgradeCost(focusTarget.module))}`
    : "Upgrade";
  dom.cooldownLine.textContent = cooldownText;
}

function renderBuildList() {
  const terminalOnline = focusTarget?.kind === "static" && focusTarget.object.id === "buildTerminal";
  dom.terminalState.textContent = terminalOnline ? "Online" : "Out of range";
  dom.terminalState.classList.toggle("online", terminalOnline);

  dom.buildList.innerHTML = modules.map((module) => {
    const level = getLevel(module);
    const unlocked = isUnlocked(module);
    const buildCost = module.cost;
    const upgradeCost = getUpgradeCost(module);
    const canBuild = terminalOnline && unlocked && level === 0 && game.credits >= buildCost && hasCapacityFor(module, 1);
    const canUpgrade = terminalOnline && unlocked && level > 0 && game.credits >= upgradeCost && hasCapacityFor(module, level + 1);
    const typeClass = module.type === "illegal" ? "illegal" : module.type === "legal" ? "legal" : "utility";
    const bonus = module.powerCapacity ? `+${formatNumber(scaled(module.powerCapacity, Math.max(level, 1)))} Power cap`
      : module.crewCapacity ? `+${formatNumber(scaled(module.crewCapacity, Math.max(level, 1)))} Crew cap`
        : module.security ? `+${formatNumber(scaled(module.security, Math.max(level, 1)))} Security`
          : `${formatSigned(scaled(module.baseIncome, Math.max(level, 1)))}/s`;
    return `
      <article class="module-row ${unlocked ? "" : "locked"}">
        <div class="module-top">
          <h3>${module.name}</h3>
          <span class="tag ${typeClass}">${module.type}</span>
        </div>
        <div class="module-meta">
          <div><span>Level</span><strong>${level}</strong></div>
          <div><span>Unlock</span><strong>${module.unlockRep} Rep</strong></div>
          <div><span>Heat</span><strong>${formatSigned(scaled(module.heat, Math.max(level, 1)))}/s</strong></div>
          <div><span>Output</span><strong>${bonus}</strong></div>
        </div>
        <div class="module-actions">
          <button class="build-button" type="button" data-action="build" data-module-id="${module.id}" ${canBuild ? "" : "disabled"}>
            ${level > 0 ? "Built" : `Build ${formatNumber(buildCost)}`}
          </button>
          <button class="build-button" type="button" data-action="upgrade" data-module-id="${module.id}" ${canUpgrade ? "" : "disabled"}>
            Upgrade ${level > 0 ? formatNumber(upgradeCost) : ""}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderRaidRisk() {
  const risk = getRaidRisk();
  dom.raidRiskText.textContent = risk.label;
  dom.raidRiskFill.style.width = `${risk.percent}%`;
  dom.raidAdvice.textContent = risk.advice;
}

function renderLog() {
  dom.eventLog.innerHTML = game.log.slice(0, 40).map((entry) => `
    <article class="log-entry ${entry.type || ""}">
      <time>${new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
      <p>${entry.message}</p>
    </article>
  `).join("");
}

function renderStory() {
  const beat = storyBeats.find((story) => story.test(game)) || storyBeats[0];
  dom.storyTitle.textContent = beat.title;
  dom.storyText.textContent = beat.text;
}

function renderObjectives() {
  dom.objectiveList.innerHTML = objectives.map((objective) => {
    const done = objective.test(game);
    return `
      <div class="objective-item ${done ? "done" : ""}">
        <span class="objective-dot"></span>
        <span>${objective.label}</span>
      </div>
    `;
  }).join("");
}

function renderTutorial() {
  const messages = [
    "The Docking Bay hatch is blinking. A freighter wants quiet fuel.",
    "Room hatches become work stations when you build them. The central terminal handles construction.",
    "Legal rooms are calmer. Illegal rooms pay harder and make Heat climb.",
    "Security drills and cloak sweeps can soften raids before they hurt.",
    "Earn 1,000,000 lifetime credits and decide what NODE-13 becomes."
  ];
  dom.tutorialText.textContent = messages[Math.min(game.tutorialStep, messages.length - 1)];
  dom.tutorialBanner.classList.toggle("hidden", game.tutorialStep >= messages.length);
}

function showRandomEvent() {
  const eventData = eventTemplates[Math.floor(Math.random() * eventTemplates.length)];
  dom.choiceTitle.textContent = eventData.title;
  dom.choiceText.textContent = eventData.text;
  dom.choiceActions.innerHTML = `
    <button type="button" data-choice="safe">${eventData.safeLabel}</button>
    <button type="button" data-choice="risky">${eventData.riskyLabel}</button>
  `;
  dom.choiceActions.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      eventData[button.dataset.choice](game);
      dom.choiceModal.classList.add("hidden");
      scheduleRandomEvent();
      renderAll();
      saveGame();
    });
  });
  dom.choiceModal.classList.remove("hidden");
  logEvent(`${eventData.title}: an incoming signal wants a decision.`, "warning");
  renderLog();
}

function scheduleRandomEvent() {
  nextEventAt = Date.now() + randomInt(30000, 60000);
}

function maybeTriggerRaid() {
  const risk = getRaidRisk();
  if (Math.random() * 100 < risk.chance) triggerRaid("Authority sweep");
}

function triggerRaid(reason = "Authority sweep") {
  calculateStats();
  game.alertUntil = Date.now() + 2600;
  const heatPressure = game.heat * 0.72;
  const defence = game.security + game.cloakStrength * 9 + Math.random() * 34;
  const severity = Math.max(0, heatPressure - defence);
  game.flags.raidHandled = true;

  if (severity < 10) {
    game.heat = Math.max(0, game.heat - 16);
    game.reputation += 2;
    logEvent(`${reason}: lookouts redirect the patrol. Heat drops after the false alarm.`, "good");
    return;
  }

  const lossRate = clamp(0.08 + severity / 260, 0.08, 0.42);
  const creditLoss = Math.min(game.credits, Math.round(game.credits * lossRate + severity * 18));
  game.credits -= creditLoss;
  game.reputation = Math.max(0, game.reputation - severity * 0.22);
  game.heat = Math.max(8, game.heat - 24);
  let damage = "";
  if (severity > 34 || Math.random() < severity / 86) damage = damageRandomModule();
  logEvent(`${reason}: patrols seize ${formatNumber(creditLoss)} credits and scatter customers. ${damage}`.trim(), "raid");
}

function damageRandomModule() {
  const damageable = getBuiltModules().filter((module) => module.id !== "dockingBay");
  if (!damageable.length) return "No module damage taken.";
  const target = damageable[Math.floor(Math.random() * damageable.length)];
  game.modules[target.id].level = Math.max(0, getLevel(target) - 1);
  return getLevel(target) === 0 ? `${target.name} is knocked offline.` : `${target.name} loses a level.`;
}

function getRaidRisk() {
  const mitigation = game.security * 0.28 + game.cloakStrength * 5;
  const chance = clamp((game.heat - 12) * 0.1 - mitigation * 0.08, 0, 22);
  const percent = clamp(chance * 4.5, 4, 100);
  if (chance < 2) return { chance, percent, label: "Quiet", advice: "Low Heat keeps patrols bored." };
  if (chance < 6) return { chance, percent, label: "Watchful", advice: "Security upgrades would soften a surprise sweep." };
  if (chance < 12) return { chance, percent, label: "High", advice: "Authority sweeps are likely. Cool Heat or fortify." };
  return { chance, percent, label: "Critical", advice: "Wanted scanners are circling NODE-13." };
}

function maybeShowEnding() {
  if (game.totalEarned < ENDING_TARGET || game.endingChosen || game.endingSeen) return;
  dom.endingModal.classList.remove("hidden");
}

function chooseEnding(ending) {
  const endings = {
    legal: "You purge the shady ledgers, license the docks, and become a glittering trade empire with suspiciously excellent lawyers.",
    criminal: "You deepen the hidden lanes, outwit the Authority, and become the Shadow Dockmaster of NODE-13.",
    sell: "You sell the station through seven shell moons, erase your trail, and disappear with a vault full of credits."
  };
  game.endingChosen = ending;
  game.endingSeen = true;
  dom.endingResult.textContent = endings[ending];
  dom.continueAfterEnding.classList.remove("hidden");
  logEvent(`Ending chosen: ${endings[ending]}`, "good");
  saveGame();
}

function respawnCrates() {
  const now = Date.now();
  game.crates.forEach((crate) => {
    if (!crate.available && crate.respawnAt && crate.respawnAt <= now) {
      crate.available = true;
      crate.respawnAt = 0;
    }
  });
}

function normalizeGame() {
  const fresh = createNewGame();
  game.version = VERSION;
  game.credits = finiteOr(game.credits, fresh.credits);
  game.totalEarned = finiteOr(game.totalEarned, game.credits);
  game.heat = finiteOr(game.heat, fresh.heat);
  game.reputation = finiteOr(game.reputation, fresh.reputation);
  game.energy = finiteOr(game.energy, fresh.energy);
  game.energyMax = finiteOr(game.energyMax, fresh.energyMax);
  game.player = game.player || fresh.player;
  game.player.x = clamp(Math.floor(finiteOr(game.player.x, fresh.player.x)), 1, MAP_WIDTH - 2);
  game.player.y = clamp(Math.floor(finiteOr(game.player.y, fresh.player.y)), 1, MAP_HEIGHT - 2);
  game.player.facing = game.player.facing || "down";
  game.modules = game.modules || {};
  modules.forEach((module) => {
    if (!game.modules[module.id]) game.modules[module.id] = { level: module.id === "dockingBay" ? 1 : 0 };
    game.modules[module.id].level = Math.max(0, Math.floor(game.modules[module.id].level || 0));
  });
  game.cooldowns = game.cooldowns || {};
  game.crates = Array.isArray(game.crates) ? game.crates : fresh.crates;
  game.flags = { ...fresh.flags, ...(game.flags || {}) };
  game.tutorialStep = finiteOr(game.tutorialStep, 0);
  game.log = Array.isArray(game.log) ? game.log.slice(0, 70) : fresh.log;
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(game));
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Save could not be loaded", error);
    return null;
  }
}

function logEvent(message, type = "") {
  game.log.unshift({ message, type, time: Date.now() });
  game.log = game.log.slice(0, 70);
}

function addCredits(amount, countLifetime = true) {
  const safeAmount = Math.max(0, Number(amount) || 0);
  game.credits += safeAmount;
  if (countLifetime) game.totalEarned += safeAmount;
}

function getModule(id) {
  return modules.find((module) => module.id === id);
}

function getLevel(module) {
  return game.modules[module.id]?.level || 0;
}

function getBuiltModules() {
  return modules.filter((module) => getLevel(module) > 0);
}

function isUnlocked(module) {
  return game.reputation >= module.unlockRep;
}

function getUpgradeCost(module) {
  const level = Math.max(1, getLevel(module));
  return Math.round((module.cost || 140) * Math.pow(1.78, level) + 120 * level);
}

function scaled(base, level) {
  if (!base || level <= 0) return 0;
  return base * level * Math.pow(1.18, level - 1);
}

function getHeatLevel() {
  if (game.heat < 30) return { label: "Low", className: "heat-low" };
  if (game.heat < 70) return { label: "Suspicious", className: "heat-suspicious" };
  if (game.heat < 110) return { label: "Dangerous", className: "heat-dangerous" };
  return { label: "Wanted", className: "heat-wanted" };
}

function facingDelta(facing) {
  if (facing === "up") return [0, -1];
  if (facing === "down") return [0, 1];
  if (facing === "left") return [-1, 0];
  return [1, 0];
}

function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatNumber(value) {
  return Math.floor(Number(value) || 0).toLocaleString();
}

function formatSigned(value) {
  const rounded = Math.abs(value) < 10 ? value.toFixed(1) : Math.round(value).toLocaleString();
  return value > 0 ? `+${rounded}` : `${rounded}`;
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

document.addEventListener("DOMContentLoaded", init);
