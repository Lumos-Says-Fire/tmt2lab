function buildDatalist() {
  const list = document.getElementById("pokemon-list");
  Object.keys(POKEMON_TYPES)
    .sort()
    .forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      list.appendChild(opt);
    });
}

function updateTypeDisplay(input, typeDisplay) {
  const pokemonName = input.value.trim().toUpperCase();
  const types = POKEMON_TYPES[pokemonName];
  
  if (types && types.length > 0) {
    typeDisplay.textContent = types.join(" / ");
    typeDisplay.style.display = "inline";
  } else {
    typeDisplay.textContent = "";
    typeDisplay.style.display = "none";
  }
}

function setupTypeDisplays() {
  const rows = document.querySelectorAll(".pokemon-input-row");
  rows.forEach(row => {
    const input = row.querySelector("input");
    const typeDisplay = row.querySelector(".type-display");
    
    input.addEventListener("input", () => {
      updateTypeDisplay(input, typeDisplay);
    });
    
    input.addEventListener("blur", () => {
      updateTypeDisplay(input, typeDisplay);
    });
  });
}

function getMultiplier(attacking, defendingTypes) {
  // Check if UNO REVERSE is in the types
  const hasUnoReverse = defendingTypes.includes("UNO REVERSE");
  
  // Filter out UNO REVERSE for calculation
  const typesForCalc = defendingTypes.filter(t => t !== "UNO REVERSE");
  
  let mult = 1;
  for (const def of typesForCalc) {
    const m = TYPE_CHART[attacking]?.[def];
    if (m !== undefined) mult *= m;
  }
  
  // If UNO REVERSE is present, invert the multiplier (except 0 and 1)
  if (hasUnoReverse && mult !== 0 && mult !== 1) {
    mult = 1 / mult;
  }
  
  return mult;
}

function multClass(m) {
  if (m === 0) return "mult-0";
  if (m === 0.125) return "mult-0125";
  if (m === 0.25) return "mult-025";
  if (m === 0.5) return "mult-05";
  if (m === 1) return "mult-1";
  if (m === 2) return "mult-2";
  if (m === 4) return "mult-4";
  if (m >= 8) return "mult-8";
  return "";
}

function analyzeTeam() {
  const inputs = Array.from(document.querySelectorAll("#team-inputs input"));
  const team = inputs
    .map(i => i.value.trim().toUpperCase())
    .filter(n => POKEMON_TYPES[n]);

  const attackers = Object.keys(TYPE_CHART).sort();

  const grid = document.createElement("table");
  const header = document.createElement("tr");
  header.innerHTML = `<th>Attack</th>` + team.map(p => `<th>${p}</th>`).join("");
  grid.appendChild(header);

  const summary = document.createElement("table");
  summary.innerHTML = `<tr><th>Attack</th><th>Weak</th><th>Resist</th><th>Immune</th></tr>`;

  attackers.forEach(atk => {
    let weak = 0, resist = 0, immune = 0;
    const row = document.createElement("tr");
    row.innerHTML = `<th>${atk}</th>`;

    team.forEach(p => {
      const m = getMultiplier(atk, POKEMON_TYPES[p]);
      if (m === 0) immune++;
      else if (m > 1) weak++;
      else if (m < 1) resist++;

      row.innerHTML += `<td class="${multClass(m)}">${m}</td>`;
    });

    grid.appendChild(row);

    const srow = document.createElement("tr");
    const th = document.createElement("th");
    th.textContent = atk;

    const weakTd = document.createElement("td");
    weakTd.textContent = weak;

    const resistTd = document.createElement("td");
    resistTd.textContent = resist;

    const immuneTd = document.createElement("td");
    immuneTd.textContent = immune;

    const majority = Math.ceil(team.length / 2);

    if (weak >= majority) weakTd.classList.add("team-bad");
    if (resist >= majority) resistTd.classList.add("team-good");
    if (immune >= majority) immuneTd.classList.add("team-good");

    srow.appendChild(th);
    srow.appendChild(weakTd);
    srow.appendChild(resistTd);
    srow.appendChild(immuneTd);
    summary.appendChild(srow);
  });

  document.getElementById("grid-container").replaceChildren(grid);
  document.getElementById("summary-container").replaceChildren(summary);
}

document.getElementById("analyze").addEventListener("click", analyzeTeam);

const waitForData = setInterval(() => {
  if (window.POKEMON_TYPES && window.TYPE_CHART) {
    clearInterval(waitForData);
    buildDatalist();
    setupTypeDisplays();
  }
}, 50);
