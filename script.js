const DEX_URL = "Too Many Types 2 Documentation - TMT2 Dex.csv";
const TYPE_CHART_URL = "Too Many Types 2 Documentation - Type Chart.csv";

/* =========================
   HELPERS
   ========================= */
function norm(s) {
  if (s === undefined || s === null) return null;
  return String(s)
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim()
    .toUpperCase();
}

function parseCSV(text) {
  return text
    .split("\n")
    .map(line => line.split(","));
}

async function loadCSV(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }
  return await response.text();
}

/* =========================
   INIT
   ========================= */
async function init() {
  const dexText = await loadCSV(DEX_URL);
  const chartText = await loadCSV(TYPE_CHART_URL);

  const dexRows = parseCSV(dexText);
  const chartRows = parseCSV(chartText);

  /* =========================
     BUILD POKEMON_TYPES
     ========================= */

  const header = dexRows[0].map(h => h.trim());
  const nameIdx = header.indexOf("Name");

  // Collect ALL type columns (Type 1, Type 2, Type 3, ...)
  const typeIndices = [];
  header.forEach((h, i) => {
    if (h.startsWith("Type")) {
      typeIndices.push(i);
    }
  });

  const POKEMON_TYPES = {};

  for (let i = 1; i < dexRows.length; i++) {
    const row = dexRows[i];
    const name = norm(row[nameIdx]);
    if (!name) continue;

    const types = [];
    for (const idx of typeIndices) {
      const t = norm(row[idx]);
      if (t) types.push(t);
    }

    if (types.length > 0) {
      POKEMON_TYPES[name] = types;
    }
  }

  console.log("Loaded Pokémon:", Object.keys(POKEMON_TYPES).length);
  console.log("Sample Pokémon:", Object.entries(POKEMON_TYPES).slice(0, 3));

  /* =========================
     BUILD TYPE_CHART
     ========================= */

  // Defenders: row 2, columns C–CD (indexes 2–81)
  const defendingTypes = [];
  for (let col = 2; col <= 81; col++) {
    const name = norm(chartRows[1][col]);
    if (name) defendingTypes.push(name);
  }

  // Attackers: column B, rows 3–82 (indexes 2–81)
  const attackingTypes = [];
  for (let row = 2; row <= 81; row++) {
    const name = norm(chartRows[row][1]);
    if (name) attackingTypes.push(name);
  }

  const TYPE_CHART = {};

  for (let a = 0; a < attackingTypes.length; a++) {
    const atk = attackingTypes[a];
    TYPE_CHART[atk] = {};

    for (let d = 0; d < defendingTypes.length; d++) {
      const cell = chartRows[a + 2][d + 2];
      const val = parseFloat(cell);
      if (!Number.isFinite(val)) continue;
      if (val !== 1) {
        TYPE_CHART[atk][defendingTypes[d]] = val;
      }
    }
  }

  console.log("Loaded attacking types:", attackingTypes.length);
  console.log("Loaded defending types:", defendingTypes.length);
  console.log("FIRE sample:", TYPE_CHART["FIRE"]);

  window.POKEMON_TYPES = POKEMON_TYPES;
  window.TYPE_CHART = TYPE_CHART;
}

init();
