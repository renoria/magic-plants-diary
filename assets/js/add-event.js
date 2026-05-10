const EVENT_TYPES = {
  watering: {
    icon: "💧",
    title: "Innaffiatura",
    label: "💧 Innaffiatura"
  },
  fertilization: {
    icon: "🧪",
    title: "Fertilizzazione",
    label: "🧪 Fertilizzazione"
  },
  repot: {
    icon: "🪴",
    title: "Rinvaso",
    label: "🪴 Rinvaso"
  },
  maintenance: {
    icon: "🛠️",
    title: "Manutenzione",
    label: "🛠️ Manutenzione"
  },
  growth: {
    icon: "🌱",
    title: "Crescita",
    label: "🌱 Crescita"
  },
  problem: {
    icon: "⚠️",
    title: "Problema",
    label: "⚠️ Problema"
  },
  note: {
    icon: "📝",
    title: "Nota",
    label: "📝 Nota"
  }
};

const WATERING_OPTIONS = ["completa", "parziale", "immersione", "doccia"];
const MAINTENANCE_OPTIONS = ["potatura", "talee", "pulizia", "supporti", "doccia foglie"];
const PROBLEM_SYMPTOMS = ["foglie gialle", "macchie", "parassiti", "marciume", "foglie molli", "crescita ferma"];
const INGREDIENT_ALIASES = {
  "terriccio universale": "teun",
  "terriccio base": "teba",
  "pomice": "pomi",
  "perlite": "perl",
  "carbone vegetale": "carb",
  "bark 20mm": "bark",
  "bark 6mm": "bark",
  "sfagno": "sfag",
  "vermiculite": "verm",
  "argilla espansa": "argi",
  "compost": "comp"
};

const params = new URLSearchParams(window.location.search);
const plantId = params.get("id");
let selectedType = normalizeType(params.get("type"));
let ingredients = [];
let selectedIngredients = [];

function normalizeType(type) {
  if (type === "water") return "watering";
  if (type === "fertilizzazione") return "fertilization";
  if (type === "trattamento" || type === "action") return "maintenance";
  return EVENT_TYPES[type] ? type : "watering";
}

function todayLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function initAddEventPage() {
  if (!plantId) {
    alert("ID pianta mancante");
    window.location.href = "plants-list.html";
    return;
  }

  document.getElementById("backToPlant").href = `plant-page.html?id=${plantId}`;
  document.getElementById("eventDate").value = todayLocal();
  populateTypeSelect();
  await loadPlantContext();
  await loadIngredients();
  renderForm();

  document.getElementById("eventType").addEventListener("change", (e) => {
    selectedType = e.target.value;
    selectedIngredients = [];
    const url = new URL(window.location.href);
    url.searchParams.set("type", selectedType);
    window.history.replaceState({}, "", url);
    renderForm();
  });

  document.getElementById("addEventForm").addEventListener("input", updatePreview);
  document.getElementById("addEventForm").addEventListener("change", updatePreview);
  document.getElementById("addEventForm").addEventListener("submit", saveEvent);
}

function populateTypeSelect() {
  const select = document.getElementById("eventType");
  select.innerHTML = "";

  Object.entries(EVENT_TYPES).forEach(([value, config]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = config.label;
    select.appendChild(option);
  });

  select.value = selectedType;
}

async function loadPlantContext() {
  const { data, error } = await db
    .from("plants")
    .select("name, scientific")
    .eq("id", plantId)
    .single();

  const context = document.getElementById("plantContext");

  if (error || !data) {
    context.textContent = "Pianta selezionata";
    return;
  }

  context.textContent = data.scientific
    ? `${data.name} · ${data.scientific}`
    : data.name;
}

async function loadIngredients() {
  const fallbackIngredients = ["teun", "pomi", "bark", "perlite", "sfagno"];

  const { data, error } = await db
    .from("ingredients")
    .select("name")
    .order("name", { ascending: true });

  ingredients = error || !Array.isArray(data) || data.length === 0
    ? fallbackIngredients
    : data.map(item => item.name).filter(Boolean);
}

function renderForm() {
  const config = EVENT_TYPES[selectedType];
  document.getElementById("eventIcon").textContent = config.icon;
  document.getElementById("eventTitle").textContent = config.title;

  const container = document.getElementById("dynamicFields");
  container.innerHTML = "";

  if (selectedType === "watering") renderWatering(container);
  if (selectedType === "repot") renderRepot(container);
  if (selectedType === "fertilization") renderFertilization(container);
  if (selectedType === "maintenance") renderMaintenance(container);
  if (selectedType === "growth") renderGrowth(container);
  if (selectedType === "problem") renderProblem(container);
  if (selectedType === "note") renderNote(container);

  updatePreview();
}

function renderWatering(container) {
  container.appendChild(createChipGroup("wateringMethod", "Metodo", WATERING_OPTIONS, false, "immersione"));
}

function renderRepot(container) {
  const row = document.createElement("div");
  row.className = "compact-row";
  row.innerHTML = `
    <div class="form-group">
      <label>Vaso prima</label>
      <input type="text" inputmode="numeric" id="oldPot" placeholder="13">
    </div>
    <div class="form-group">
      <label>Vaso nuovo</label>
      <input type="text" inputmode="numeric" id="newPot" placeholder="18">
    </div>
  `;
  container.appendChild(row);

  container.appendChild(createIngredientPicker());
}

function renderFertilization(container) {
  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Fertilizzante</label>
    <input type="text" id="fertilizerName" placeholder="es. fito concime piante verdi">
  `;
  container.appendChild(group);
}

function renderMaintenance(container) {
  container.appendChild(createChipGroup("maintenanceType", "Intervento", MAINTENANCE_OPTIONS, true));

  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Dettaglio opzionale</label>
    <input type="text" id="maintenanceDetail" placeholder="es. stralci in idro a radicare">
  `;
  container.appendChild(group);
}

function renderGrowth(container) {
  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Cosa hai notato?</label>
    <input type="text" id="growthText" placeholder="es. Due foglie nuove!">
  `;
  container.appendChild(group);
}

function renderProblem(container) {
  container.appendChild(createChipGroup("problemSymptom", "Sintomo", PROBLEM_SYMPTOMS, false, "foglie gialle"));

  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Gravità</label>
    <select id="problemSeverity">
      <option value="">Non specificata</option>
      <option value="lieve">Lieve</option>
      <option value="media">Media</option>
      <option value="alta">Alta</option>
    </select>
  `;
  container.appendChild(group);
}

function renderNote(container) {
  const group = document.createElement("div");
  group.className = "form-group";
  group.innerHTML = `
    <label>Nota veloce</label>
    <input type="text" id="noteText" placeholder="es. Terreno idrofobico / da rinvasare con calma">
  `;
  container.appendChild(group);
}

function createChipGroup(name, label, options, multiple = false, defaultValue = "") {
  const group = document.createElement("div");
  group.className = "form-group";

  const title = document.createElement("label");
  title.textContent = label;
  group.appendChild(title);

  const grid = document.createElement("div");
  grid.className = "chip-grid";
  grid.dataset.chipGroup = name;
  grid.dataset.multiple = multiple ? "true" : "false";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.value = option;
    button.textContent = option;

    if (option === defaultValue) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      if (multiple) {
        button.classList.toggle("selected");
      } else {
        grid.querySelectorAll(".chip").forEach(chip => chip.classList.remove("selected"));
        button.classList.add("selected");
      }

      updatePreview();
    });

    grid.appendChild(button);
  });

  group.appendChild(grid);
  return group;
}

function createIngredientPicker() {
  const group = document.createElement("div");
  group.className = "form-group";

  const title = document.createElement("label");
  title.textContent = "Ingredienti";
  group.appendChild(title);

  const chips = document.createElement("div");
  chips.className = "chip-grid";

  ingredients.forEach((name) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.dataset.name = name;
    button.textContent = name;

    button.addEventListener("click", () => {
      button.classList.toggle("selected");
      toggleIngredient(name);
      renderIngredientAmounts(group);
      updatePreview();
    });

    chips.appendChild(button);
  });

  group.appendChild(chips);

  const hint = document.createElement("p");
  hint.className = "field-hint";
  hint.textContent = "Tocca gli ingredienti e indica la percentuale usata.";
  group.appendChild(hint);

  const builder = document.createElement("div");
  builder.className = "ingredient-builder";
  builder.id = "ingredientBuilder";
  group.appendChild(builder);

  return group;
}

function toggleIngredient(name) {
  const exists = selectedIngredients.find(item => item.name === name);

  if (exists) {
    selectedIngredients = selectedIngredients.filter(item => item.name !== name);
    return;
  }

  selectedIngredients.push({ name, amount: "" });
}

function renderIngredientAmounts(group) {
  const builder = group.querySelector("#ingredientBuilder");
  builder.innerHTML = "";

  selectedIngredients.forEach((ingredient) => {
    const row = document.createElement("div");
    row.className = "ingredient-row";

    const name = document.createElement("span");
    name.textContent = ingredient.name;
    row.appendChild(name);

    const amount = document.createElement("input");
    amount.type = "text";
    amount.inputMode = "numeric";
    amount.placeholder = "%";
    amount.value = ingredient.amount;
    amount.addEventListener("input", () => {
      ingredient.amount = amount.value;
      updatePreview();
    });
    row.appendChild(amount);

    builder.appendChild(row);
  });
}

function selectedChipValues(name) {
  const group = document.querySelector(`[data-chip-group="${name}"]`);
  if (!group) return [];

  return Array.from(group.querySelectorAll(".chip.selected"))
    .map(chip => chip.dataset.value);
}

function buildEventText() {
  if (selectedType === "watering") {
    const method = selectedChipValues("wateringMethod")[0] || "immersione";
    return `Innaffiatura: ${method}`;
  }

  if (selectedType === "repot") {
    const oldPot = document.getElementById("oldPot")?.value.trim();
    const newPot = document.getElementById("newPot")?.value.trim();
    const mix = selectedIngredients
      .filter(item => item.name && item.amount)
      .map(item => `${item.amount}${shortIngredientName(item.name)}`)
      .join(" + ");

    if (!oldPot || !newPot || !mix) return "";
    return `Rinvaso: ${oldPot} → ${newPot} • ${mix}`;
  }

  if (selectedType === "fertilization") {
    const product = document.getElementById("fertilizerName")?.value.trim();
    return product
      ? `Innaffiato con fertilizzante (${product})`
      : "Innaffiato con fertilizzante";
  }

  if (selectedType === "maintenance") {
    const actions = selectedChipValues("maintenanceType");
    const detail = document.getElementById("maintenanceDetail")?.value.trim();
    const base = actions.length ? actions.join(" + ") : "";

    if (!base && !detail) return "";
    if (base && detail) return `Manutenzione: ${base} - ${detail}`;
    return `Manutenzione: ${base || detail}`;
  }

  if (selectedType === "growth") {
    return document.getElementById("growthText")?.value.trim() || "";
  }

  if (selectedType === "problem") {
    const symptom = selectedChipValues("problemSymptom")[0] || "";
    const severity = document.getElementById("problemSeverity")?.value;

    if (!symptom) return "";
    return severity ? `Problema: ${symptom} (${severity})` : `Problema: ${symptom}`;
  }

  if (selectedType === "note") {
    return document.getElementById("noteText")?.value.trim() || "";
  }

  return "";
}

function shortIngredientName(name) {
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (INGREDIENT_ALIASES[normalized]) {
    return INGREDIENT_ALIASES[normalized];
  }

  const firstWord = normalized.split(" ")[0] || "";
  return firstWord.slice(0, 4) || name.slice(0, 4).toLowerCase();
}

function updatePreview() {
  const text = buildEventText();
  document.getElementById("eventPreview").textContent = text || "Compila i campi richiesti";
}

async function saveEvent(e) {
  e.preventDefault();

  const text = buildEventText();
  const date = document.getElementById("eventDate").value;

  if (!date) {
    alert("Scegli una data");
    return;
  }

  if (!text) {
    alert("Completa i campi dell'evento");
    return;
  }

  const { error } = await db.from("events").insert([
    {
      plant_id: plantId,
      date: date,
      type: selectedType,
      text: text
    }
  ]);

  if (error) {
    console.error(error);
    alert("Errore salvataggio");
    return;
  }

  window.location.href = `plant-page.html?id=${plantId}`;
}

document.addEventListener("DOMContentLoaded", initAddEventPage);
