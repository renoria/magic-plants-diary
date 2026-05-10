async function loadPlantPage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("id");

    if (!plantId) {
      console.error("ID mancante nella URL");
      return;
    }

    // 👉 PIANTA
    const { data: plant, error: plantError } = await db
      .from("plants")
      .select("*")
      .eq("id", plantId)
      .single();

    if (plantError || !plant) {
      console.error("Errore plant:", plantError);
      return;
    }

    // 👉 EVENTI
    const { data: events, error: eventsError } = await db
      .from("events")
      .select("*")
      .eq("plant_id", plantId)
      .order("date", { ascending: false });

    if (eventsError) {
      console.error("Errore events:", eventsError);
    }

    // =========================
    // HEADER PIANTA
    // =========================

    document.getElementById("plantName").textContent = plant.name;
    document.getElementById("plantScientific").textContent = plant.scientific;
    document.getElementById("plantOrigin").textContent = plant.origin || "—";
    document.getElementById("plantDate").textContent = formatDate(plant.date);
    document.getElementById("plantLight").textContent = plant.light;
    document.getElementById("plantTemp").textContent = plant.temperature;
    document.getElementById("plantWaterRule").textContent = plant.watering_rule;

    const statusEl = document.getElementById("plantStatus");
    statusEl.className = "status-dot " + plant.status;

    document.getElementById("editPlantBtn").href =
      `edit-plant.html?id=${plantId}`;

    document.querySelectorAll(".add-event-btn").forEach((button) => {
      const type = button.dataset.eventType;
      button.href = `add-event.html?id=${plantId}&type=${type}`;
    });

    // =========================
    // EVENTI
    // =========================

    const plantEvents = Array.isArray(events) ? events : [];

    // 💧 INNAFFIATURA
    const waterContainer = document.getElementById("wateringHistory");
    waterContainer.innerHTML = "";

    const wateringEvents = plantEvents
      .filter(e => normalizeEventType(e.type) === "watering")
      .slice(0, 10);

    renderRows(waterContainer, wateringEvents);

    // 🧪 TRATTAMENTI
    const treatmentsContainer = document.getElementById("plantTreatments");
    treatmentsContainer.innerHTML = "";

    const treatmentEvents = plantEvents
      .filter(e => ["fertilization", "repot"].includes(normalizeEventType(e.type)));

    renderRows(treatmentsContainer, treatmentEvents);

    // 📓 DIARIO
    const diaryContainer = document.getElementById("plantEvents");
    diaryContainer.innerHTML = "";

    const diaryEvents = plantEvents
      .filter(e => ["maintenance", "growth", "problem", "note"].includes(normalizeEventType(e.type)));

    renderRows(diaryContainer, diaryEvents, true);

  } catch (err) {
    console.error("Errore pagina pianta:", err);
  }
}


// =========================
// MODIFICA PIANTA
// =========================


// =========================
// COMPONENT ROW
// =========================

function renderRows(container, events, showIcon = false) {
  if (events.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nessun evento";
    container.appendChild(empty);
    return;
  }

  events.forEach(ev => {
    container.appendChild(createRow(ev, showIcon));
  });
}

function createRow(ev, showIcon = false) {
  const row = document.createElement("div");
  row.className = "diary-row";

  const date = document.createElement("span");
  date.className = "date";
  date.textContent = formatDate(ev.date);

  const text = document.createElement("p");
  text.textContent = `${showIcon ? getIcon(ev.type) + " " : ""}${ev.text}`;

  row.appendChild(date);
  row.appendChild(text);

  return row;
}

// =========================
// UTILS
// =========================

function formatDate(dateStr) {
  if (!dateStr) return "—";

  const d = new Date(dateStr);
  return d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "short"
  });
}

function getIcon(type) {
  switch (normalizeEventType(type)) {
    case "watering": return "💧";
    case "repot": return "🪴";
    case "problem": return "⚠️";
    case "fertilization": return "🧪";
    case "maintenance": return "🛠️";
    case "growth": return "🌱";
    case "note": return "📝";
    default: return "•";
  }
}

function normalizeEventType(type) {
  switch (type) {
    case "water":
      return "watering";
    case "fertilizzazione":
      return "fertilization";
    case "trattamento":
    case "action":
      return "maintenance";
    default:
      return type;
  }
}

// start
loadPlantPage();
