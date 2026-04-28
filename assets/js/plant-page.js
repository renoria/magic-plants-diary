async function loadPlantPage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const plantId = params.get("id");

    if (!plantId) {
      console.error("ID mancante nella URL");
      return;
    }

    // 👉 PRENDE UNA SOLA PIANTA
    const { data: plant, error: plantError } = await db
      .from("plants")
      .select("*")
      .eq("id", plantId)
      .single();

    if (plantError || !plant) {
      console.error("Errore plant:", plantError);
      return;
    }

    // 👉 PRENDE EVENTI DI QUELLA PIANTA
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

    // =========================
    // EVENTI
    // =========================

    const plantEvents = events || [];

    // 💧 INNAFFIATURA
    const waterContainer = document.getElementById("wateringHistory");
    waterContainer.innerHTML = "";

    plantEvents
      .filter(e => e.type === "water")
      .slice(0, 10)
      .forEach(ev => {
        waterContainer.appendChild(createRow(ev));
      });

    // 🧪 TRATTAMENTI
    const treatmentsContainer = document.getElementById("plantTreatments");
    treatmentsContainer.innerHTML = "";

    plantEvents
      .filter(e => e.type === "trattamento" || e.type === "fertilizzazione")
      .forEach(ev => {
        treatmentsContainer.appendChild(createRow(ev));
      });

    // 📒 DIARIO
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