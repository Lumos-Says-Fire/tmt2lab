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

  console.log("Dex rows:", dexRows.length);
  console.log("Type chart rows:", chartRows.length);

  /* =========================
     BUILD POKEMON_TYPES
     ========================= */
  const header = dexRows[0];
  const nameIdx = header.indexOf("Name");
  const type1Idx = header.indexOf("Type 1");
  const type2Idx = header.indexOf("Type 2");

  const POKEMON_TYPES = {};

  for (let i = 1; i < dexRows.length; i++) {
    const row = dexRows[i];
    const name = norm(row[nameIdx]);
    if (!name) continue;

    const types = [];
    if (row[type1Idx]) types.push(norm(row[type1Idx]));
    if (row[type2Idx]) types.push(norm(row[type2Idx]));

    if (types.length > 0) {
      POKEMON_TYPES[name] = types;
    }
  }

  console.log("Loaded Pokémon:", Object.keys(POKEMON_TYPES).length);
  console.log("Sample Pokémon:", Object.entries(POKEMON_TYPES).slice(0, 3));

  /* =========================
     BUILD TYPE_CHART
     ========================= */

  // Defenders: row 2 (index 1), columns C–CD (2–81)
  const defendingTypes = chartRows[1]
    .slice(2, 82)
    .map(norm)
    .filter(Boolean);

  // Attackers: column B (index 1), rows 3–82 (2–81)
  const attackingTypes = chartRows
    .slice(2, 82)
    .map(row => norm(row[1]))
    .filter(Boolean);

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

  console.log("Loaded attacking types:", Object.keys(TYPE_CHART).length);
  console.log("FIRE sample:", TYPE_CHART["FIRE"]);

  /* Keep globals for next steps */
  window.POKEMON_TYPES = POKEMON_TYPES;
  window.TYPE_CHART = TYPE_CHART;
}

init();
