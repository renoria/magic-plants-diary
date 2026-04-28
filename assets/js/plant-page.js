async function loadPlantPage() {
  try {
    // 👉 prendi ID dalla URL
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("id");

    // 👉 carica dati
    const plantsRes = await fetch("assets/data/plants.json");
    const plants = await plantsRes.json();

    const eventsRes = await fetch("assets/data/events.json");
    const events = await eventsRes.json();

    // 👉 trova pianta
    const plant = plants.find(p => p.id === plantId);

    if (!plant) {
      console.error("Pianta non trovata");
      return;
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

    // status dot
    const statusEl = document.getElementById("plantStatus");
    statusEl.classList.add(plant.status);

    // =========================
    // FILTRO EVENTI
    // =========================

    const plantEvents = events
      .filter(e => e.plant_id === plantId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // =========================
    // INNAFFIATURA
    // =========================

    const waterContainer = document.getElementById("wateringHistory");

    const waterEvents = plantEvents.filter(e => e.type === "water");

    waterContainer.innerHTML = "";

    waterEvents.slice(0, 10).forEach(ev => {
      waterContainer.appendChild(createRow(ev));
    });

    // =========================
    // TRATTAMENTI
    // =========================

    const treatmentsContainer = document.getElementById("plantTreatments");

    const treatmentEvents = plantEvents.filter(e =>
      e.type === "trattamento" || e.type === "fertilizzazione"
    );

    treatmentsContainer.innerHTML = "";

    treatmentEvents.forEach(ev => {
      treatmentsContainer.appendChild(createRow(ev));
    });

    // =========================
    // DIARIO (tutto)
    // =========================

    const diaryContainer = document.getElementById("plantEvents");

    diaryContainer.innerHTML = "";

    plantEvents.forEach(ev => {
      diaryContainer.appendChild(createRow(ev, true));
    });

  } catch (err) {
    console.error("Errore pagina pianta:", err);
  }
}

// =========================
// COMPONENT ROW
// =========================

function createRow(ev, showIcon = false) {
  const row = document.createElement("div");
  row.className = "diary-row";

  row.innerHTML = `
    <span class="date">${formatDate(ev.date)}</span>
    <p>
      ${showIcon ? getIcon(ev.type) + " " : ""}
      ${ev.text}
    </p>
  `;

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
  switch (type) {
    case "water": return "💧";
    case "repot": return "🪴";
    case "problem": return "⚠️";
    case "fertilizzazione": return "🌿";
    case "trattamento": return "🧪";
    case "growth": return "🌱";
    default: return "•";
  }
}

// start
loadPlantPage();